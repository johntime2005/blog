import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		pinned: z.boolean().optional().default(false),
		author: z.string().optional().default(""),
		sourceLink: z.string().optional().default(""),
		licenseName: z.string().optional().default(""),
		licenseUrl: z.string().optional().default(""),

		/* Page encryption fields */
		encrypted: z.boolean().optional().default(false),
		password: z.string().optional().default(""), // 已弃用：不推荐在 frontmatter 中存储密码
		encryptionId: z.string().optional(), // 加密 ID，用于在 Cloudflare KV 中查找密码

		series: z.string().optional(),

		/* Visibility control fields */
		visibility: z
			.enum(["public", "unlisted", "private"])
			.optional()
			.default("public"), // public: 完全公开 | unlisted: 仅链接可访问 | private: 完全隐藏
		hideFromHome: z.boolean().optional().default(false), // 从首页隐藏
		hideFromArchive: z.boolean().optional().default(false), // 从归档页隐藏
		hideFromSearch: z.boolean().optional().default(false), // 从搜索结果隐藏
		showInWidget: z.boolean().optional().default(true), // 是否在侧边栏组件中显示

		/* Sorting and ranking fields */
		customOrder: z.number().optional(), // 自定义排序优先级（数字越小越靠前）
		featuredLevel: z.number().min(0).max(5).optional().default(0), // 推荐级别 0-5

		/* Layout and display fields */
		postLayout: z
			.enum(["default", "wide", "fullscreen", "no-sidebar"])
			.optional()
			.default("default"), // 文章布局模板（重命名避免与 Astro 5 的 layout 字段冲突）

		/* SEO control fields */
		seoNoIndex: z.boolean().optional().default(false), // 是否添加 noindex
		seoNoFollow: z.boolean().optional().default(false), // 是否添加 nofollow

		/* Access control */
		accessLevel: z
			.enum(["public", "members-only", "restricted"])
			.optional()
			.default("public"), // 访问控制级别

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
