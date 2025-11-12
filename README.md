
<img src="./docs/images/1131.png" width = "405" height = "511" alt="NapCat" align=right />

<div align="center">

# Firefly
> 一款清新美观的 Astro 博客主题模板
</div>


---

[**🖥️在线预览(Netlify)**](https://demo-firefly.netlify.app/)  &emsp;
[**📝使用文档**](https://docs-firefly.cuteleaf.cn/) &emsp;
[**🍀我的博客**](https://blog.cuteleaf.cn) 

⚡ 静态站点生成: 基于Astro的超快加载速度和SEO优化

🎨 现代化设计: 简洁美观的界面，支持自定义主题色

📱 移动友好: 完美的响应式体验，移动端专项优化

🌟 看板娘支持: 同时支持Spine和Live2D动画引擎

🔧 高度可配置: 大部分功能模块均可通过配置文件自定义

<img alt="firefly" src="./docs/images/1.png" />

<table>
  <tr>
    <td valign="top"><img src="./docs/images/2.png"></td>
    <td valign="top"><img src="./docs/images/3.png"></td>
  </tr>
 </table>

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 9

### 本地开发部署

1. **克隆仓库：**
   ```bash
   git clone https://github.com/Cuteleaf/Firefly.git
   cd Firefly
   ```

2. **安装依赖：**
   ```bash
   # 如果没有安装 pnpm，先安装
   npm install -g pnpm

   # 安装项目依赖
   pnpm install
   ```

3. **运行初始化脚本（首次配置必需）：**

   **方法 1：Web 界面向导（推荐）**

   部署后，首次访问你的博客网站，会自动跳转到初始化设置向导页面。按照向导填写信息，完成后下载配置文件并提交到 GitHub。

   **方法 2：命令行脚本（本地开发）**

   ```bash
   pnpm init
   ```

   脚本会交互式地询问你的网站信息、个人信息和主题配置，自动完成个性化配置。

   > 💡 **提示**: 查看 [INIT_GUIDE.md](./INIT_GUIDE.md) 获取详细的初始化指南

4. **启动开发服务器：**
   ```bash
   pnpm dev
   ```
   博客将在 `http://localhost:4321` 可用

### 平台托管部署

#### 一键部署到 Cloudflare Pages

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/johntime2005/blog)

点击上方按钮即可一键部署到 Cloudflare Pages。部署前请确保：
- 拥有 Cloudflare 账号
- 已登录 GitHub

> ⚠️ **重要**: 部署后请立即运行 `pnpm init` 配置你的个性化信息！详见 [INIT_GUIDE.md](./INIT_GUIDE.md)

#### 其他平台部署

- **参考[官方指南](https://docs.astro.build/zh-cn/guides/deploy/)将博客部署至 Vercel, Netlify, GitHub Pages 等。**
- **Cloudflare Pages 完整部署教程**: 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细的 Cloudflare Pages 部署指南

## 📖 配置说明

> 📚 **快速配置指南**: 查看 [INIT_GUIDE.md](./INIT_GUIDE.md) 获取详细的初始化和配置步骤
> 📚 **完整配置文档**: 查看 [Firefly使用文档](https://docs-firefly.cuteleaf.cn/) 获取完整的配置指南
> 📚 **AI 开发文档**: 查看 [CLAUDE.md](./CLAUDE.md) 获取项目架构和开发指南

### 配置文件结构

```
src/
├── config/
│   ├── index.ts              # 配置索引文件
│   ├── siteConfig.ts         # 站点基础配置
│   ├── profileConfig.ts      # 用户资料配置
│   ├── commentConfig.ts      # 评论系统配置
│   ├── announcementConfig.ts # 公告配置
│   ├── licenseConfig.ts      # 许可证配置
│   ├── footerConfig.ts       # 页脚配置
│   ├── FooterConfig.html     # 页脚HTML内容
│   ├── expressiveCodeConfig.ts # 代码高亮配置
│   ├── sakuraConfig.ts       # 樱花特效配置
│   ├── fontConfig.ts         # 字体配置
│   ├── sidebarConfig.ts      # 侧边栏布局配置
│   ├── navBarConfig.ts       # 导航栏配置
│   ├── musicConfig.ts        # 音乐播放器配置
│   ├── pioConfig.ts          # 看板娘配置
│   ├── adConfig.ts           # 广告配置
│   └── friendsConfig.ts      # 友链配置
```


## ⚙️ 文章 Frontmatter

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # 仅当文章语言与 `config.ts` 中的网站语言不同时需要设置
---
```

## 🧞 指令

下列指令均需要在项目根目录执行：

| Command                           | Action                            |
|:----------------------------------|:----------------------------------|
| `pnpm install` 并 `pnpm add sharp` | 安装依赖                              |
| `pnpm init`                       | **运行初始化脚本配置个性化信息（首次使用必需）**      |
| `pnpm dev`                        | 在 `localhost:4321` 启动本地开发服务器      |
| `pnpm build`                      | 构建网站至 `./dist/`                   |
| `pnpm preview`                    | 本地预览已构建的网站                        |
| `pnpm new-post <filename>`        | 创建新文章                             |
| `pnpm astro ...`                  | 执行 `astro add`, `astro check` 等指令 |
| `pnpm astro --help`               | 显示 Astro CLI 帮助                   |


## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](../LICENSE) 文件。

## 🙏 致谢

- 感谢原始 [Fuwari](https://github.com/saicaca/fuwari) 模板
- 感谢基于Fuwari二次开发的[Mizuki](https://github.com/matsuzaka-yuki/Mizuki) 模板
- 本项目基于 [Firefly](https://github.com/CuteLeaf/Firefly) 进行个性化配置和部署优化
- 查看本项目的定制版本: [johntime2005/blog](https://github.com/johntime2005/blog)
- 感谢b站up[公公的日常](https://space.bilibili.com/3546750017080050)提供的Q版 流萤 看板娘切片数据模型
- 使用 [Astro](https://astro.build) 和 [Tailwind CSS](https://tailwindcss.com) 构建
- 图标来自 [Iconify](https://iconify.design/)
---

如有问题或建议，请提交 [Issue](https://github.com/CuteLeaf/Firefly/issues) 或 [Pull Request](https://github.com/CuteLeaf/Firefly/pulls)。
