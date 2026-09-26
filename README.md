# sayso-web

顺口说（Sayso）的官方网站：首页（含在线体验）、常见问题、下载页。用 TanStack Start 构建，所有页面在构建时预渲染成静态 HTML，部署到 Cloudflare Pages 免费套餐，不运行任何 Worker 代码。

正式地址：<https://sayso-app.pages.dev> · 应用仓库：<https://github.com/zuijiaosy/sayso>

## 本地开发

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build          # 拉取最新发布信息，预渲染到 dist/client，生成 sitemap.xml 和 robots.txt
pnpm preview:cf     # 用 wrangler 按 Cloudflare Pages 的方式托管 dist/client（http://localhost:8788）
pnpm typecheck
```

## 页面里有什么

- **首页演示**（`src/components/demo/`）：聊天窗口 + 屏幕底部的录音胶囊。按住或点一下按钮“说话”，按脚本走一遍「录音 → 识别中 → 整理中/翻译中 → 粘贴」。胶囊的样式照搬客户端的 `src/overlay/RecordingOverlay.css`。不使用麦克风。
- **在线体验客户端**（`src/components/mock/`）：主窗口的六个页面（首页、历史、使用情况、模型、词典、设置），布局、文案和控件对应客户端的 `src/voiceless/`。开关、分段、下拉、改快捷键、下载模型、词典增删、深色模式都能操作，改动保存在浏览器的 localStorage 里。页面其他位置可以用 `goTo({ page, theme })` 跳转它。
- **数据去向图**（`src/components/DataFlow.tsx`）：三种配置下哪些线穿过网络边界。

配色、圆角和字体取自客户端的 `src/styles/theme.css`：暖石色中性色、唯一的珊瑚色强调色 `#f4633a`、衬线标题。客户端改了主题后，同步 `src/styles.css` 和 `src/mock.css` 顶部的变量。

## 更新和部署

站点只从本地部署，仓库里不放任何 Cloudflare 凭据，也没有自动部署的 CI。

版本号和下载链接不写死：`scripts/fetch-release.mjs` 在每次构建前请求 GitHub API，把应用最新发布的版本号、日期和 .dmg / -setup.exe / .msi 的直链写进 `src/generated/release.json`（请求失败时保留已提交的文件，按钮退回到发布页）。所以应用发了新版之后，在本地重新部署一次即可：

```bash
npx wrangler login      # 第一次使用时登录
pnpm run deploy         # 拉取最新发布 → 构建 → 发布到 Cloudflare Pages 的 sayso 项目（--branch main）
```

绑定自己的域名后，用 `VITE_SITE_URL=https://你的域名 pnpm run deploy` 构建，canonical、Open Graph 和 sitemap 都会用它。

## 图标

`public/` 里的 favicon、`mark.svg` 和 `og.png` 都从应用仓库的 `src/assets/sayso-mark.svg` 生成（需要 rsvg-convert 和 ImageMagick）：

```bash
pnpm icons              # 默认读取 ../sayso/src/assets/sayso-mark.svg，可用 SAYSO_MARK 指定
```

## 目录

```
src/routes/             页面：index、download、faq、404
src/components/demo/    首页的口述演示和录音胶囊
src/components/mock/    客户端主窗口的网页版
src/content/faq.ts      常见问题，[Fn] 显示为按键，`路径` 显示为代码，**粗体**
src/site.ts             域名、下载地址、最新版本信息
src/generated/          构建时写入的 release.json
scripts/                拉取发布信息、生成 sitemap、生成图标
```
