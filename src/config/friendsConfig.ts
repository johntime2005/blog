import type { FriendLink } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "Firefly",
		imgurl: "https://docs-firefly.cuteleaf.cn/logo.png",
		desc: "Firefly 一款清新美观的 Astro 博客主题模板",
		siteurl: "https://github.com/CuteLeaf/Firefly",
		tags: ["GitHub", "Theme"],
		weight: 10,
		enabled: true,
	},
	{
		title: "Astro",
		imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
		desc: "The web framework for content-driven websites. ⭐️ Star to support our work!",
		siteurl: "https://github.com/withastro/astro",
		tags: ["Framework"],
		weight: 9,
		enabled: true,
	},
	// 在这里添加你的友链
	// {
	// 	title: "友链名称",
	// 	imgurl: "头像URL",
	// 	desc: "站点描述",
	// 	siteurl: "https://example.com",
	// 	tags: ["标签1", "标签2"],
	// 	weight: 8,
	// 	enabled: true,
	// },
];

// 获取启用的友链并按权重排序
export const getEnabledFriends = (): FriendLink[] => {
	return friendsConfig
		.filter((friend) => friend.enabled)
		.sort((a, b) => b.weight - a.weight); // 按权重降序排序
};
