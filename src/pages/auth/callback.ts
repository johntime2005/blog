// OAuth 回调端点
export const prerender = false;

export async function GET({ request, locals }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // 处理用户拒绝授权
  if (error) {
    console.error('[OAuth] GitHub 授权失败:', error, errorDescription);
    return new Response(
      buildErrorPage(
        '授权被拒绝',
        error === 'access_denied'
          ? '您拒绝了授权请求。要使用 CMS 管理后台，需要授予 GitHub 访问权限。'
          : `授权失败: ${error}`,
        [
          '1. 点击下方按钮重新尝试授权',
          '2. 在 GitHub 授权页面点击"授权"',
          '3. 确保您的 GitHub 账号有仓库访问权限'
        ],
        errorDescription || undefined
      ),
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }

  // 检查授权码
  if (!code) {
    console.error('[OAuth] 缺少授权码');
    return new Response(
      buildErrorPage(
        '授权参数缺失',
        '未收到 GitHub 授权码。这可能是授权流程被中断。',
        ['请重新开始授权流程']
      ),
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }

  const runtime = locals.runtime as any;
  const clientId = runtime?.env?.GITHUB_CLIENT_ID;
  const clientSecret = runtime?.env?.GITHUB_CLIENT_SECRET;

  // 检查环境变量
  if (!clientId || !clientSecret) {
    console.error('[OAuth] 环境变量未配置', { hasClientId: !!clientId, hasClientSecret: !!clientSecret });
    return new Response(
      buildErrorPage(
        '服务器配置错误',
        'GitHub OAuth 环境变量未正确配置。',
        [
          '请联系管理员配置以下环境变量：',
          '• GITHUB_CLIENT_ID',
          '• GITHUB_CLIENT_SECRET'
        ]
      ),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }

  try {
    console.log('[OAuth] 正在交换授权码为访问令牌...');

    // 交换授权码为访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await tokenResponse.json();

    // 检查 GitHub API 错误
    if (data.error) {
      console.error('[OAuth] GitHub API 错误:', data);
      return new Response(
        buildErrorPage(
          'GitHub 授权失败',
          `GitHub 返回错误: ${data.error}`,
          ['请重新尝试授权', '确保 OAuth App 配置正确'],
          data.error_description || data.error_uri
        ),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    // 检查访问令牌
    if (!data.access_token) {
      console.error('[OAuth] 未收到访问令牌:', data);
      return new Response(
        buildErrorPage(
          '令牌获取失败',
          '无法从 GitHub 获取访问令牌。',
          ['请重新尝试授权', '如果问题持续，请检查 OAuth App 配置']
        ),
        {
          status: 500,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    console.log('[OAuth] 授权成功，准备返回 CMS');

    // Decap CMS 期望的消息格式
    const postMsgContent = {
      token: data.access_token,
      provider: "github"
    };

    // 返回成功页面
    return new Response(
      buildSuccessPage(postMsgContent),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  } catch (error) {
    console.error('[OAuth] 令牌交换失败:', error);
    return new Response(
      buildErrorPage(
        '授权过程出错',
        '在处理 GitHub 授权时发生错误。',
        ['请重新尝试授权', '如果问题持续，请联系管理员'],
        error instanceof Error ? error.message : String(error)
      ),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
}

function buildSuccessPage(postMsgContent: { token: string; provider: string }): string {
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
      console.log('[OAuth] Origin:', origin);

      if (window.opener) {
        console.log('[OAuth] 检测到 opener，准备发送消息');

        // Decap CMS OAuth 握手流程
        function receiveMessage(e) {
          console.log('[OAuth] 收到来自 opener 的消息:', e.data);

          // 发送成功消息
          const successMessage = 'authorization:github:success:' + JSON.stringify(postMsgContent);
          console.log('[OAuth] 发送成功消息');
          window.opener.postMessage(successMessage, e.origin);

          // 移除监听器
          window.removeEventListener("message", receiveMessage, false);

          // 延迟关闭窗口
          setTimeout(function() {
            console.log('[OAuth] 关闭窗口');
            window.close();
          }, 500);
        }

        // 监听来自 opener 的消息
        window.addEventListener("message", receiveMessage, false);

        // 通知 opener 授权进行中
        console.log('[OAuth] 发送 authorizing 消息');
        window.opener.postMessage("authorizing:github", origin);

        // 5秒后如果窗口还未关闭，提供手动关闭选项
        setTimeout(function() {
          if (!window.closed) {
            console.log('[OAuth] 窗口未自动关闭，显示手动关闭选项');
            document.querySelector('.fallback').innerHTML += '<br><button onclick="window.close()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">关闭此窗口</button>';
          }
        }, 5000);
      } else {
        // 如果没有 opener，使用 localStorage 传递 token
        console.log('[OAuth] 无 opener，使用 localStorage 存储 token');
        try {
          localStorage.setItem('netlify-cms-user', JSON.stringify(postMsgContent));
          console.log('[OAuth] Token 已保存到 localStorage');

          // 重定向回管理面板
          setTimeout(function() {
            window.location.href = '/admin';
          }, 1000);
        } catch (e) {
          console.error('[OAuth] 无法保存到 localStorage:', e);
          document.querySelector('.message').textContent = '授权完成，请手动返回管理后台。';
        }
      }
    })();
  </script>
</body>
</html>
  `;
}

function buildErrorPage(title: string, message: string, steps: string[], detail?: string): string {
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
    .detail {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 24px;
      font-size: 12px;
      color: #856404;
      word-break: break-all;
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
    ${steps.length > 0 ? `
    <div class="steps">
      <h3>解决步骤：</h3>
      <ol>
        ${steps.map(step => `<li>${step}</li>`).join('')}
      </ol>
    </div>
    ` : ''}
    ${detail ? `<div class="detail"><strong>详细信息：</strong><br>${detail}</div>` : ''}
    <div class="actions">
      <a href="/auth" class="primary">重新授权</a>
      <a href="/admin" class="secondary">返回后台</a>
    </div>
  </div>
</body>
</html>
  `;
}
