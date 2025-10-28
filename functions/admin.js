/**
 * Cloudflare Pages Function to serve admin interface
 * Handles /admin and /admin/ requests with proper Decap CMS configuration
 */

export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 如果请求是/admin或/admin/，提供admin/index.html
  if (pathname === '/admin' || pathname === '/admin/') {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>Content Manager</title>
  <script>
    // Configure Decap CMS to load config from API endpoint
    window.CMS_CONFIG = {
      backend: {
        name: "github",
        repo: "johntime2005/blog",
        branch: "main"
      },
      media_folder: "public/assets/images",
      public_folder: "/assets/images",
      publish_mode: "editorial_workflow",
      site_url: "https://blog.johntime.top",
      display_url: "https://blog.johntime.top",
      logo_url: "https://blog.johntime.top/favicon/favicon-96x96.png",
      collections: [
        {
          name: "posts",
          label: "博客文章",
          label_singular: "文章",
          folder: "src/content/posts",
          create: true,
          slug: "{{slug}}",
          preview_path: "posts/{{slug}}",
          fields: [
            { label: "标题", name: "title", widget: "string", required: true },
            { label: "发布日期", name: "published", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false, format: "YYYY-MM-DD", required: true },
            { label: "置顶", name: "pinned", widget: "boolean", default: false, required: false },
            { label: "简介", name: "description", widget: "text", required: true },
            { label: "标签", name: "tags", widget: "list", allow_add: true, default: ["博客"], required: true },
            { label: "分类", name: "category", widget: "string", default: "默认分类", required: true },
            { label: "草稿", name: "draft", widget: "boolean", default: false, required: true },
            { label: "封面图", name: "image", widget: "image", required: false, hint: "可选：文章封面图片" },
            { label: "正文", name: "body", widget: "markdown", required: true }
          ]
        }
      ]
    };
  </script>
</head>
<body>
  <!-- Include the script that builds the page and powers Decap CMS -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  <script>
    // Ensure CMS is initialized with our config
    if (window.CMS && window.CMS_CONFIG) {
      window.CMS.init({ config: window.CMS_CONFIG });
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  // 对于其他请求，返回404
  return new Response('Not Found', { status: 404 });
};

