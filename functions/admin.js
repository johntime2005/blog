/**
 * Cloudflare Pages Function to serve admin interface
 * Handles /admin and /admin/ requests
 */

export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 如果请求是/admin或/admin/，提供admin/index.html
  if (pathname === '/admin' || pathname === '/admin/') {
    // 重定向到/admin/index.html
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>Content Manager</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      }
    );
  }

  // 对于其他请求，返回404
  return new Response('Not Found', { status: 404 });
};
