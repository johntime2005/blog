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

      console.log('OAuth callback received, data:', data);

      // Decap CMS 期望的消息格式：只包含 token 和 provider
      const postMsgContent = ${JSON.stringify(postMsgContent)};
      const message = 'authorization:github:success:' + JSON.stringify(postMsgContent);

      console.log('Sending message to opener:', message);

      if (window.opener) {
        // 使用 "*" 以确保消息能够跨域传递
        window.opener.postMessage(message, "*");
        console.log('Message sent, attempting to close window...');

        // 延迟关闭，确保消息已发送
        setTimeout(function() {
          window.close();
        }, 1000);
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
