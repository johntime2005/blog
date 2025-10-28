export async function GET() {
  // 从public/admin/config.yml读取配置
  const configYml = `# Decap CMS 配置文件
# 文档: https://decapcms.org/docs/configuration-options/

backend:
  name: github
  repo: johntime2005/blog
  branch: main

media_folder: "public/assets/images"
public_folder: "/assets/images"

publish_mode: editorial_workflow

site_url: https://blog.johntime.top
display_url: https://blog.johntime.top
logo_url: https://blog.johntime.top/favicon/favicon-96x96.png

collections:
  - name: "posts"
    label: "博客文章"
    label_singular: "文章"
    folder: "src/content/posts"
    create: true
    slug: "{{slug}}"
    preview_path: "posts/{{slug}}"
    
    fields:
      - { label: "标题", name: "title", widget: "string", required: true }
      - { label: "发布日期", name: "published", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false, format: "YYYY-MM-DD", required: true }
      - { label: "置顶", name: "pinned", widget: "boolean", default: false, required: false }
      - { label: "简介", name: "description", widget: "text", required: true }
      - { label: "标签", name: "tags", widget: "list", allow_add: true, default: ["博客"], required: true }
      - { label: "分类", name: "category", widget: "string", default: "默认分类", required: true }
      - { label: "草稿", name: "draft", widget: "boolean", default: false, required: true }
      - { label: "封面图", name: "image", widget: "image", required: false, hint: "可选：文章封面图片" }
      - { label: "正文", name: "body", widget: "markdown", required: true }
`;

  return new Response(configYml, {
    status: 200,
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
