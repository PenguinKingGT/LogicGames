# PUZZLE HOUSE

一个使用 Next.js 构建的轻量逻辑小游戏合集。目前包含：

- `/games/mastermind`：彩码谜局，根据颜色与位置反馈破解四位密码。
- `/games/polymine`：PolyMine，在正方形、三角形和六边形棋盘上推理排雷。
- `/games/nonogram`：数织，根据行列数字线索还原隐藏图案。
- `/games/circle-cat`：圈小猫，封住圆点路线，在小猫到达边缘前把它圈住。

首页 `/` 是游戏菜单，每个游戏使用独立路由、状态和样式作用域。

## 技术栈

- Next.js App Router + React + TypeScript
- pnpm
- Vitest + Testing Library
- Tailwind CSS 4 + 原生 CSS
- Phaser（仅 PolyMine 按需加载）

需要 Node.js 22.12 或更高版本，以及 pnpm 11.8。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。

## 质量检查

```bash
pnpm lint
pnpm typecheck
pnpm test --run
pnpm test:coverage
pnpm build
```

也可以一次执行完整检查：

```bash
pnpm check
```

## 项目结构

```text
src/
  app/                    Next.js 页面与全站样式
  components/site/        首页和游戏路由公共导航
  games/catalog.ts        首页使用的静态游戏目录
  games/mastermind/       彩码谜局完整实现
  games/polymine/         PolyMine 完整实现
  games/nonogram/         数织完整实现
  games/circle-cat/       圈小猫完整实现
```

两个迁移来源项目不是运行时依赖。新增游戏时，将实现放在
`src/games/<slug>/`，在 `src/app/games/<slug>/page.tsx` 创建独立页面，并向
`src/games/catalog.ts` 添加菜单信息。不要从目录文件导出运行时游戏组件，
否则可能把 Phaser 等大型依赖带入首页包。

## 当前边界

游戏数据仅保存在浏览器本地。目前不包含账号、服务端存档、排行榜或联网对战。

圈小猫的小猫待机与奔跑动画使用 Segel 发布的 CC0 素材，许可和处理记录见
`public/games/circle-cat/ASSET_LICENSES.md`。棋盘、界面与音效均由项目代码生成。
