import type { APIRoute } from "astro";
import type { SetupData } from "../../types/setup";
import JSZip from "jszip";

export const POST: APIRoute = async ({ request }) => {
	try {
		const data: SetupData = await request.json();

		// 生成 siteConfig.ts 内容
		const siteConfigContent = generateSiteConfig(data);

		// 生成 profileConfig.ts 内容
		const profileConfigContent = generateProfileConfig(data);

		// 生成 astro.config.mjs 内容
		const astroConfigContent = generateAstroConfig(data);

		// 生成 robots.txt 内容
		const robotsTxtContent = generateRobotsTxt(data);

		// 生成 README 说明文件
		const readmeContent = generateReadme(data);

		// 使用 JSZip 打包
		const zip = new JSZip();

		// 创建目录结构
		const configFolder = zip.folder("src/config");
		const publicFolder = zip.folder("public");

		// 添加文件
		configFolder?.file("siteConfig.ts", siteConfigContent);
		configFolder?.file("profileConfig.ts", profileConfigContent);
		zip.file("astro.config.mjs", astroConfigContent);
		publicFolder?.file("robots.txt", robotsTxtContent);
		zip.file("README_SETUP.md", readmeContent);

		// 生成 ZIP 文件
		const zipBlob = await zip.generateAsync({ type: "blob" });

		// 返回 ZIP 文件
		return new Response(zipBlob, {
			status: 200,
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": "attachment; filename=firefly-config.zip",
			},
		});
	} catch (error) {
		console.error("生成配置文件失败:", error);
		return new Response(JSON.stringify({ error: "生成配置文件失败" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};

// 生成 siteConfig.ts 内容
function generateSiteConfig(data: SetupData): string {
	const { siteInfo, themeConfig } = data;
	const keywords = siteInfo.keywords
		? siteInfo.keywords.split(",").map((k) => `"${k.trim()}"`)
		: [];

	return `import type { SiteConfig } from "../types/config";
import { fontConfig } from "./fontConfig";

// 定义站点语言
const SITE_LANG = "zh_CN"; // 语言代码，例如：'en', 'zh_CN', 'ja' 等。

export const siteConfig: SiteConfig = {
	// ✅ 已完成初始化配置
	initialized: true,

	title: "${siteInfo.title}",
	subtitle: "${siteInfo.subtitle}",
	description: "${siteInfo.description}",
	keywords: [${keywords.join(", ")}],

	lang: SITE_LANG,

	themeColor: {
		hue: ${themeConfig.themeHue}, // 主题色的默认色相，范围从 0 到 360
		fixed: false, // 对访问者隐藏主题色选择器
		defaultMode: "system", // 默认模式："light" 浅色，"dark" 深色，"system" 跟随系统
	},

	favicon: [
		// 留空以使用默认 favicon
		{
			src: "/assets/images/favicon.ico", // 图标文件路径
			theme: "light", // 可选，指定主题 'light' | 'dark'
			sizes: "32x32", // 可选，图标大小
		},
	],

	// 网站Logo
	logoIcon: {
		type: "image",
		value: "/assets/images/LiuYingPure3.svg",
		alt: "🍀",
	},

	// 追番配置
	bangumi: {
		userId: "${data.profileInfo.bangumiUserId || ""}", // 在此处设置你的Bangumi用户ID
	},

	// 文章页底部的"上次编辑时间"卡片开关
	showLastModified: true,

	// OpenGraph图片功能
	generateOgImages: false,

	// 页面开关配置
	pages: {
		anime: ${data.profileInfo.bangumiUserId ? "true" : "false"}, // 追番页面
		projects: true,
		timeline: true,
		skills: true,
	},

	// 文章列表布局配置
	postListLayout: {
		defaultMode: "list",
		allowSwitch: true,
	},

	// 分页配置
	pagination: {
		postsPerPage: 8,
	},

	backgroundWallpaper: {
		enable: true,
		mode: "banner",
		src: {
			desktop: "/assets/images/d1.webp",
			mobile: "/assets/images/m1.webp",
		},
		position: "0% 20%",
		banner: {
			homeText: {
				enable: true,
				title: "${siteInfo.title}",
				subtitle: [
					"${siteInfo.subtitle}",
					"In Reddened Chrysalis, I Once Rest",
					"From Shattered Sky, I Free Fall",
					"Amidst Silenced Stars, I Deep Sleep",
				],
				typewriter: {
					enable: true,
					speed: 100,
					deleteSpeed: 50,
					pauseTime: 2000,
				},
			},
			credit: {
				enable: {
					desktop: true,
					mobile: false,
				},
				text: {
					desktop: "晚晚喵",
					mobile: "Mobile Credit",
				},
				url: {
					desktop: "https://www.pixiv.net/artworks/135490046",
					mobile: "",
				},
			},
			navbar: {
				transparentMode: "semifull",
			},
			waves: {
				enable: {
					desktop: true,
					mobile: true,
				},
			},
		},
		overlay: {
			zIndex: -1,
			opacity: 0.8,
			blur: 1,
		},
	},

	toc: {
		enable: true,
		depth: 3,
	},

	font: fontConfig,
};
`;
}

// 生成 profileConfig.ts 内容
function generateProfileConfig(data: SetupData): string {
	const { profileInfo } = data;
	const links: string[] = [];

	if (profileInfo.githubUsername) {
		links.push(`\t\t{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/${profileInfo.githubUsername}",
		}`);
	}

	if (profileInfo.bilibiliUid) {
		links.push(`\t\t{
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/${profileInfo.bilibiliUid}",
		}`);
	}

	return `import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	avatar: "/assets/images/avatar.webp",
	name: "${profileInfo.name}",
	bio: "${profileInfo.bio}",
	links: [
${links.join(",\n")}
	],
};
`;
}

// 生成 astro.config.mjs 内容
function generateAstroConfig(data: SetupData): string {
	// 读取当前的 astro.config.mjs 并替换 site URL
	// 这里简化处理，只替换 site 配置
	return `import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig, siteConfig } from "./src/config";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { rehypeMermaid } from "./src/plugins/rehype-mermaid.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "${data.siteInfo.siteUrl}",
  base: "/",
  trailingSlash: "always",

  integrations: [
      tailwind({ nesting: true }),
      swup({
          theme: false,
          animationClass: "transition-swup-",
          containers: ["main"],
          smoothScrolling: false,
          cache: true,
          preload: false,
          accessibility: true,
          updateHead: true,
          updateBodyClass: false,
          globalInstance: true,
          resolveUrl: (url) => url,
          animateHistoryBrowsing: false,
          skipPopStateHandling: (event) => {
              return event.state && event.state.url && event.state.url.includes("#");
          },
      }),
      icon({
          include: {
              "preprocess: vitePreprocess(),": ["*"],
              "fa6-brands": ["*"],
              "fa6-regular": ["*"],
              "fa6-solid": ["*"],
              mdi: ["*"],
          },
      }),
      expressiveCode({
          themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
          plugins: [
              pluginCollapsibleSections(),
              pluginLineNumbers(),
              pluginLanguageBadge(),
              pluginCustomCopyButton(),
          ],
          defaultProps: {
              wrap: true,
              overridesByLang: {
                  shellsession: { showLineNumbers: false },
              },
          },
          styleOverrides: {
              codeBackground: "var(--codeblock-bg)",
              borderRadius: "0.75rem",
              borderColor: "none",
              codeFontSize: "0.875rem",
              codeFontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              codeLineHeight: "1.5rem",
              frames: {
                  editorBackground: "var(--codeblock-bg)",
                  terminalBackground: "var(--codeblock-bg)",
                  terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
                  editorTabBarBackground: "var(--codeblock-topbar-bg)",
                  editorActiveTabBackground: "none",
                  editorActiveTabIndicatorBottomColor: "var(--primary)",
                  editorActiveTabIndicatorTopColor: "none",
                  editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
                  terminalTitlebarBorderBottomColor: "none",
              },
              textMarkers: {
                  delHue: 0,
                  insHue: 180,
                  markHue: 250,
              },
          },
          frames: { showCopyToClipboardButton: false },
      }),
      svelte(),
      sitemap({
          filter: (page) => {
              const url = new URL(page);
              const pathname = url.pathname;
              if (pathname === '/anime/' && !siteConfig.pages.anime) return false;
              if (pathname === '/projects/' && !siteConfig.pages.projects) return false;
              if (pathname === '/timeline/' && !siteConfig.pages.timeline) return false;
              if (pathname === '/skills/' && !siteConfig.pages.skills) return false;
              return true;
          },
      }),
  ],

  markdown: {
      remarkPlugins: [
          remarkMath,
          remarkReadingTime,
          remarkExcerpt,
          remarkGithubAdmonitionsToDirectives,
          remarkDirective,
          remarkSectionize,
          parseDirectiveNode,
          remarkMermaid,
      ],
      rehypePlugins: [
          rehypeKatex,
          rehypeSlug,
          rehypeMermaid,
          [
              rehypeComponents,
              {
                  components: {
                      github: GithubCardComponent,
                      note: (x, y) => AdmonitionComponent(x, y, "note"),
                      tip: (x, y) => AdmonitionComponent(x, y, "tip"),
                      important: (x, y) => AdmonitionComponent(x, y, "important"),
                      caution: (x, y) => AdmonitionComponent(x, y, "caution"),
                      warning: (x, y) => AdmonitionComponent(x, y, "warning"),
                  },
              },
          ],
          [
              rehypeAutolinkHeadings,
              {
                  behavior: "append",
                  properties: { className: ["anchor"] },
                  content: {
                      type: "element",
                      tagName: "span",
                      properties: { className: ["anchor-icon"], "data-pagefind-ignore": true },
                      children: [{ type: "text", value: "#" }],
                  },
              },
          ],
      ],
  },

  vite: {
      build: {
          rollupOptions: {
              onwarn(warning, warn) {
                  if (
                      warning.message.includes("is dynamically imported by") &&
                      warning.message.includes("but also statically imported by")
                  ) {
                      return;
                  }
                  warn(warning);
              },
          },
      },
  },

  adapter: cloudflare(),
});
`;
}

// 生成 robots.txt 内容
function generateRobotsTxt(data: SetupData): string {
	return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

Sitemap: ${data.siteInfo.siteUrl}sitemap-index.xml
`;
}

// 生成 README 说明文件
function generateReadme(data: SetupData): string {
	return `# 🎉 Firefly 博客配置文件

## 配置信息

- **网站标题**: ${data.siteInfo.title}
- **网站 URL**: ${data.siteInfo.siteUrl}
- **作者**: ${data.profileInfo.name}

## 📥 如何使用这些配置文件

### 1. 解压文件

将下载的 \`firefly-config.zip\` 解压到本地。

### 2. 克隆你的仓库

\`\`\`bash
git clone <你的 GitHub 仓库地址>
cd <仓库目录>
\`\`\`

### 3. 复制配置文件

将解压后的文件复制到对应位置：

\`\`\`bash
# 复制配置文件
cp firefly-config/src/config/siteConfig.ts src/config/
cp firefly-config/src/config/profileConfig.ts src/config/
cp firefly-config/astro.config.mjs .
cp firefly-config/public/robots.txt public/
\`\`\`

### 4. 提交到 GitHub

\`\`\`bash
git add .
git commit -m "chore: 完成初始化配置"
git push
\`\`\`

### 5. 等待自动部署

Cloudflare Pages 会自动检测到提交并重新部署你的网站。大约 2-5 分钟后，你的个性化博客就上线了！

## 🎨 下一步

- **替换图片**: 在 \`public/assets/images/\` 目录下替换头像、Logo 和背景图
- **创建文章**: 使用 \`pnpm new-post 文章标题\` 创建新文章
- **自定义配置**: 查看 \`src/config/\` 目录下的其他配置文件进行更多自定义

## 📚 帮助文档

- [项目文档](./CLAUDE.md)
- [初始化指南](./INIT_GUIDE.md)
- [部署指南](./DEPLOYMENT.md)

## ❓ 遇到问题？

如果遇到任何问题，请：
1. 检查 GitHub 仓库的 Actions 标签页查看构建日志
2. 查看 [Issues](https://github.com/johntime2005/blog/issues)
3. 参考项目文档

祝你创作愉快！✨
`;
}
