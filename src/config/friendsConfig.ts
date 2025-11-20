import type { FriendLink } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链配置
// 添加友链示例：
// {
//   title: "友链名称",
//   imgurl: "https://example.com/avatar.jpg",
//   desc: "友链描述",
//   siteurl: "https://example.com",
//   tags: ["Blog", "Tech"],
//   weight: 10, // 权重，数字越大排序越靠前
//   enabled: true, // 是否启用
// }
export const friendsConfig: FriendLink[] = [
	// 在这里添加您的友链
];

// 获取启用的友链并按权重排序
export const getEnabledFriends = (): FriendLink[] => {
	return friendsConfig
		.filter((friend) => friend.enabled)
		.sort((a, b) => b.weight - a.weight); // 按权重降序排序
};
