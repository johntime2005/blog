// OAuth 回调端点
export const prerender = false;

export async function GET({ request, locals }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(`OAuth Error: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  const runtime = locals.runtime as any;
  const clientId = runtime?.env?.GITHUB_CLIENT_ID;
  const clientSecret = runtime?.env?.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Cloudflare Pages environment variables.', { status: 500 });
  }

  try {
    // Exchange code for access token
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

    if (data.error) {
      return new Response(JSON.stringify(data), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Decap CMS 期望的消息格式
    const postMsgContent = {
      token: data.access_token,
      provider: "github"
    };

    // Return success HTML that posts message to opener
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authorization Success</title>
</head>
<body>
  <p>Authorization successful! This window should close automatically...</p>
  <script>
    (function() {
      const data = ${JSON.stringify(data)};
      const origin = window.location.origin;

      console.log('OAuth callback received, data:', data);
      console.log('Origin:', origin);

      // Decap CMS 期望的消息格式：只包含 token 和 provider
      const postMsgContent = ${JSON.stringify(postMsgContent)};

      if (window.opener) {
        // Decap CMS OAuth 握手流程
        function receiveMessage(e) {
          console.log('Received message from opener:', e.data, 'origin:', e.origin);

          // 收到来自 opener 的消息后，发送 success 消息
          const successMessage = 'authorization:github:success:' + JSON.stringify(postMsgContent);
          console.log('Sending success message:', successMessage);

          window.opener.postMessage(successMessage, e.origin);

          // 移除监听器
          window.removeEventListener("message", receiveMessage, false);

          // 延迟关闭窗口
          setTimeout(function() {
            console.log('Closing window...');
            window.close();
          }, 1000);
        }

        // 监听来自 opener 的消息
        window.addEventListener("message", receiveMessage, false);

        // 首先发送 authorizing 消息通知 opener
        console.log('Sending authorizing message to opener');
        window.opener.postMessage("authorizing:github", origin);
      } else {
        // 如果没有 opener（直接访问的情况），使用 localStorage 传递 token
        console.log('No window.opener, storing token in localStorage');
        try {
          localStorage.setItem('netlify-cms-user', JSON.stringify(postMsgContent));
          // 重定向回管理面板
          window.location.href = '/admin';
        } catch (e) {
          console.error('Failed to store token:', e);
          document.body.innerHTML = '<p>Authorization complete. Please <a href="/admin">return to admin panel</a>.</p>';
        }
      }
    })();
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
