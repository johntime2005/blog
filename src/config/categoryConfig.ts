import type { CategoryConfigMap } from "../types/admin";

/**
 * 默认类别配置
 *
 * 这个配置在构建时使用,作为类别管理的基础
 * 可以在后台界面中修改,修改后的配置存储在 Cloudflare KV 中
 */
export const defaultCategoryConfig: CategoryConfigMap = {
	// 示例类别配置
	// tutorials: {
	// 	id: "tutorials",
	// 	name: "教程",
	// 	icon: "material-symbols:book-2",
	// 	description: "技术教程与指南",
	// 	showInHome: true,
	// 	order: 1,
	// 	color: "#3b82f6",
	// 	slug: "tutorials",
	// },
};

/**
 * 获取类别配置
 *
 * @returns 类别配置映射
 */
export function getCategoryConfig(): CategoryConfigMap {
	return defaultCategoryConfig;
}

/**
 * 获取类别列表(按顺序排序)
 *
 * @returns 排序后的类别列表
 */
export function getCategoriesList() {
	return Object.values(defaultCategoryConfig).sort((a, b) => a.order - b.order);
}

/**
 * 根据 ID 获取类别
 *
 * @param id 类别 ID
 * @returns 类别对象或 undefined
 */
export function getCategoryById(id: string) {
	return defaultCategoryConfig[id];
}

/**
 * 检查类别是否应该在主页显示
 *
 * @param categoryId 类别 ID
 * @returns 是否在主页显示
 */
export function shouldShowCategoryInHome(categoryId: string | null | undefined): boolean {
	if (!categoryId) return true; // 未分类的文章默认显示

	const category = defaultCategoryConfig[categoryId];
	if (!category) return true; // 未知类别默认显示

	return category.showInHome;
}
