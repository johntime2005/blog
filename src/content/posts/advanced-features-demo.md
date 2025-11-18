---
title: "高级文章管理功能演示"
published: 2025-11-17
updated: 2025-11-17
description: "演示 Firefly 博客的高级文章管理功能，包括可见性控制、排序、布局和 SEO 选项"
image: ""
tags: ["功能演示", "教程", "博客管理"]
category: "教程"
draft: false

# 高级可见性控制示例
visibility: "public"        # public | unlisted | private
hideFromHome: false         # 在首页显示
hideFromArchive: false      # 在归档页显示
hideFromSearch: false       # 可被搜索到
showInWidget: true          # 在侧边栏显示

# 排序与推荐示例
customOrder: 1              # 最高优先级，排在最前面
featuredLevel: 5            # 最高推荐级别

# 布局控制
postLayout: "default"       # default | wide | fullscreen | no-sidebar

# SEO 控制
seoNoIndex: false           # 允许搜索引擎索引
seoNoFollow: false          # 允许搜索引擎跟踪链接

# 访问控制
accessLevel: "public"       # public | members-only | restricted
---

# 高级文章管理功能演示

欢迎查看 Firefly 博客的高级文章管理功能！本文将演示所有新增的文章控制选项。

## 🎯 功能总览

### 1. 可见性控制

你现在可以精细控制文章在不同位置的显示：

- **全局可见性** (`visibility`): `public`、`unlisted`、`private`
- **页面级隐藏**:
  - `hideFromHome`: 从首页隐藏
  - `hideFromArchive`: 从归档页隐藏
  - `hideFromSearch`: 从搜索结果隐藏
- **组件控制**: `showInWidget` 控制是否在侧边栏显示

### 2. 排序与推荐

- **自定义排序** (`customOrder`): 精确控制文章在列表中的位置
- **推荐级别** (`featuredLevel`): 0-5 级推荐，用于特殊展示

### 3. 布局自定义

- `default`: 默认布局
- `wide`: 宽屏布局
- `fullscreen`: 全屏布局
- `no-sidebar`: 无侧边栏布局

### 4. SEO 精细控制

- `seoNoIndex`: 控制搜索引擎是否索引
- `seoNoFollow`: 控制是否跟踪页面链接

## 📖 使用示例

### 示例 1：低调分享的内部文档

```yaml
---
title: 内部项目文档
visibility: "unlisted"
hideFromHome: true
hideFromSearch: true
seoNoIndex: true
---
```

### 示例 2：精选推荐文章

```yaml
---
title: 必读教程
customOrder: 1
featuredLevel: 5
pinned: true
---
```

### 示例 3：旧文章归档

```yaml
---
title: 2020年总结
hideFromHome: true
showInWidget: false
customOrder: 9999
---
```

## 🔒 隐私保护方案

| 方案 | 隐私级别 | 文件是否生成 |
|------|---------|------------|
| `draft: true` | ⭐⭐⭐⭐⭐ | 否（生产环境） |
| `visibility: "private"` | ⭐⭐⭐⭐⭐ | 否（生产环境） |
| `visibility: "unlisted"` | ⭐⭐⭐ | 是 |
| `encrypted: true` | ⭐⭐⭐⭐ | 是（加密） |

## 📚 完整文档

查看 [ADVANCED_POST_MANAGEMENT.md](../ADVANCED_POST_MANAGEMENT.md) 获取：

- 详细的字段说明
- 完整的使用示例
- 常见问题解答
- 技术实现细节

## 🎉 开始使用

只需在你的文章 frontmatter 中添加需要的字段即可：

```yaml
---
title: 我的文章
published: 2025-11-17
# 添加你需要的控制选项
hideFromHome: false
featuredLevel: 3
layout: "wide"
---
```

就这么简单！享受更强大的文章管理体验吧！
