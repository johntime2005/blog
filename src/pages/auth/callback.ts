// OAuth 回调端点 - 完整的 state 验证和安全令牌处理
import {
	hmacSha256,
	securityHeaders,
	timingSafeEqual,
} from "../../utils/security";

export const prerender = false;

export async function GET({ request, locals, cookies }) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const callbackState = url.searchParams.get("state");
	const error = url.searchParams.get("error");
	const errorDescription = url.searchParams.get("error_description");

	// 处理用户拒绝授权
	if (error) {
		console.error("[OAuth] GitHub 授权失败:", error, errorDescription);
		return new Response(
			buildErrorPage(
				"授权被拒绝",
				error === "access_denied"
					? "您拒绝了授权请求。要使用 CMS 管理后台，需要授予 GitHub 访问权限。"
					: `授权失败: ${error}`,
				[
					"1. 点击下方按钮重新尝试授权",
					'2. 在 GitHub 授权页面点击"授权"',
					"3. 确保您的 GitHub 账号有仓库访问权限",
				],
			),
			{
				status: 400,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					...securityHeaders,
				},
			},
		);
	}

	// 检查授权码
	if (!code) {
		console.error("[OAuth] 缺少授权码");
		return new Response(
			buildErrorPage(
				"授权参数缺失",
				"未收到 GitHub 授权码。这可能是授权流程被中断。",
				["请重新开始授权流程"],
			),
			{
				status: 400,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					...securityHeaders,
				},
			},
		);
	}

	// 🔒 验证 state 参数（防止 CSRF 攻击）
	const savedState = cookies.get("oauth_state")?.value;

	if (!callbackState || !savedState) {
		console.error("[OAuth] State 参数缺失", {
			hasCallbackState: !!callbackState,
			hasSavedState: !!savedState,
		});
		return new Response(
			buildErrorPage(
				"安全验证失败",
				"OAuth 状态参数缺失或无效。这可能是 CSRF 攻击或会话过期。",
				["请重新开始授权流程", "确保浏览器允许 Cookie"],
			),
			{
				status: 403,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					...securityHeaders,
				},
			},
		);
	}

	// 使用时间安全的比较（防止时序攻击）
	if (!timingSafeEqual(callbackState, savedState)) {
		console.error("[OAuth] State 验证失败 - 可能的 CSRF 攻击");
		return new Response(
			buildErrorPage("安全验证失败", "OAuth 状态参数不匹配。请重新授权。", [
				"请重新开始授权流程",
			]),
			{
				status: 403,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					...securityHeaders,
				},
			},
		);
	}

	// 验证 state 签名（如果包含签名）
	const runtime = locals.runtime as any;
	const clientId = runtime?.env?.GITHUB_CLIENT_ID;
	const clientSecret = runtime?.env?.GITHUB_CLIENT_SECRET;

	if (clientSecret) {
		const stateParts = savedState.split(".");
		if (stateParts.length === 3) {
			const [timestamp, random, signature] = stateParts;
			const stateData = `${timestamp}.${random}`;
			const expectedSignature = await hmacSha256(clientSecret, stateData);

			if (!timingSafeEqual(signature, expectedSignature)) {
				console.error("[OAuth] State 签名验证失败");
				return new Response(
					buildErrorPage("安全验证失败", "OAuth 状态签名无效。", [
						"请重新开始授权流程",
					]),
					{
						status: 403,
						headers: {
							"Content-Type": "text/html; charset=utf-8",
							...securityHeaders,
						},
					},
				);
			}

			// 验证时间戳（10分钟有效期）
			const stateTime = Number.parseInt(timestamp, 10);
			if (isNaN(stateTime) || Date.now() - stateTime > 600000) {
				console.error("[OAuth] State 已过期");
				return new Response(
					buildErrorPage("授权已过期", "OAuth 授权请求已过期，请重新授权。", [
						"请重新开始授权流程",
					]),
					{
						status: 403,
						headers: {
							"Content-Type": "text/html; charset=utf-8",
							...securityHeaders,
						},
					},
				);
			}
		}
	}

	// 清除已使用的 state cookie
	cookies.delete("oauth_state", { path: "/" });

	// 检查环境变量
	if (!clientId || !clientSecret) {
		console.error("[OAuth] 环境变量未配置", {
			hasClientId: !!clientId,
			hasClientSecret: !!clientSecret,
		});
		return new Response(
			buildErrorPage("服务器配置错误", "GitHub OAuth 环境变量未正确配置。", [
				"请联系管理员配置以下环境变量：",
				"• GITHUB_CLIENT_ID",
				"• GITHUB_CLIENT_SECRET",
			]),
			{
				status: 500,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					...securityHeaders,
				},
			},
		);
	}

	try {
		console.log("[OAuth] 正在交换授权码为访问令牌...");

		// 交换授权码为访问令牌
		const tokenResponse = await fetch(
			"https://github.com/login/oauth/access_token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					client_id: clientId,
					client_secret: clientSecret,
					code: code,
				}),
			},
		);

		const data = await tokenResponse.json();

		// 检查 GitHub API 错误
		if (data.error) {
			console.error("[OAuth] GitHub API 错误:", data.error);
			return new Response(
				buildErrorPage("GitHub 授权失败", `GitHub 返回错误: ${data.error}`, [
					"请重新尝试授权",
					"确保 OAuth App 配置正确",
				]),
				{
					status: 400,
					headers: {
						"Content-Type": "text/html; charset=utf-8",
						...securityHeaders,
					},
				},
			);
		}

		// 检查访问令牌
		if (!data.access_token) {
			console.error("[OAuth] 未收到访问令牌");
			return new Response(
				buildErrorPage("令牌获取失败", "无法从 GitHub 获取访问令牌。", [
					"请重新尝试授权",
					"如果问题持续，请检查 OAuth App 配置",
				]),
				{
					status: 500,
					headers: {
						"Content-Type": "text/html; charset=utf-8",
						...securityHeaders,
					},
				},
			);
		}

		console.log("[OAuth] 授权成功，准备返回 CMS");

		// Decap CMS 期望的消息格式
		const postMsgContent = {
			token: data.access_token,
			provider: "github",
		};

		// 返回成功页面
		return new Response(buildSuccessPage(postMsgContent), {
			status: 200,
			headers: {
				"Content-Type": "text/html; charset=utf-8",
				...securityHeaders,
			},
		});
	} catch (error) {
		console.error("[OAuth] 令牌交换失败:", error);
		return new Response(
			buildErrorPage("授权过程出错", "在处理 GitHub 授权时发生错误。", [
				"请重新尝试授权",
				"如果问题持续，请联系管理员",
			]),
			{
				status: 500,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					...securityHeaders,
				},
			},
		);
	}
}

function buildSuccessPage(postMsgContent: {
	token: string;
	provider: string;
}): string {
	return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>授权成功 - 博客管理后台</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 500px;
      padding: 40px;
      text-align: center;
    }
    .success-icon {
      font-size: 64px;
      margin-bottom: 20px;
      animation: scaleIn 0.5s ease-out;
    }
    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    h1 {
      color: #27ae60;
      font-size: 24px;
      margin-bottom: 16px;
    }
    .message {
      color: #555;
      font-size: 16px;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .loading {
      margin: 20px 0;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .fallback {
      margin-top: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 14px;
      color: #666;
    }
    .fallback a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .fallback a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✅</div>
    <h1>授权成功！</h1>
    <p class="message">正在返回管理后台...</p>
    <div class="loading">
      <div class="spinner"></div>
    </div>
    <div class="fallback">
      窗口未自动关闭？<br>
      <a href="/admin">点击这里返回管理后台</a>
    </div>
  </div>
  <script>
    (function() {
      const postMsgContent = ${JSON.stringify(postMsgContent)};
      const origin = window.location.origin;

      console.log('[OAuth] 授权成功，token 已接收');

      if (window.opener) {
        console.log('[OAuth] 检测到 opener，准备发送消息');

        // Decap CMS OAuth 握手流程
        function receiveMessage(e) {
          console.log('[OAuth] 收到来自 opener 的消息');

          // 发送成功消息
          const successMessage = 'authorization:github:success:' + JSON.stringify(postMsgContent);
          window.opener.postMessage(successMessage, e.origin);

          // 移除监听器
          window.removeEventListener("message", receiveMessage, false);

          // 延迟关闭窗口
          setTimeout(function() {
            window.close();
          }, 500);
        }

        // 监听来自 opener 的消息
        window.addEventListener("message", receiveMessage, false);

        // 通知 opener 授权进行中
        window.opener.postMessage("authorizing:github", origin);

        // 5秒后如果窗口还未关闭，提供手动关闭选项
        setTimeout(function() {
          if (!window.closed) {
            document.querySelector('.fallback').innerHTML += '<br><button onclick="window.close()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">关闭此窗口</button>';
          }
        }, 5000);
      } else {
        // 如果没有 opener，使用 sessionStorage（比 localStorage 更安全，关闭标签页后清除）
        console.log('[OAuth] 无 opener，使用 sessionStorage 临时存储');
        try {
          sessionStorage.setItem('netlify-cms-user', JSON.stringify(postMsgContent));

          // 重定向回管理面板
          setTimeout(function() {
            window.location.href = '/admin';
          }, 1000);
        } catch (e) {
          console.error('[OAuth] 无法保存到 sessionStorage');
          document.querySelector('.message').textContent = '授权完成，请手动返回管理后台。';
        }
      }
    })();
  </script>
</body>
</html>
  `;
}

function buildErrorPage(
	title: string,
	message: string,
	steps: string[],
): string {
	return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 博客管理后台</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      padding: 40px;
      text-align: center;
    }
    h1 {
      color: #e74c3c;
      font-size: 24px;
      margin-bottom: 16px;
    }
    .message {
      color: #555;
      font-size: 16px;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .steps {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      text-align: left;
    }
    .steps h3 {
      color: #333;
      font-size: 14px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .steps ol {
      margin-left: 20px;
      color: #666;
      font-size: 14px;
      line-height: 1.8;
    }
    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    button, a {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      border: none;
    }
    .primary {
      background: #667eea;
      color: white;
    }
    .primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .secondary {
      background: #e9ecef;
      color: #495057;
    }
    .secondary:hover {
      background: #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>❌ ${title}</h1>
    <p class="message">${message}</p>
    ${
			steps.length > 0
				? `
    <div class="steps">
      <h3>解决步骤：</h3>
      <ol>
        ${steps.map((step) => `<li>${step}</li>`).join("")}
      </ol>
    </div>
    `
				: ""
		}
    <div class="actions">
      <a href="/auth" class="primary">重新授权</a>
      <a href="/admin" class="secondary">返回后台</a>
    </div>
  </div>
</body>
</html>
  `;
}
