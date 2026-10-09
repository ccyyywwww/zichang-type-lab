# GitHub 发布前检查清单

这份清单用于把当前本地项目整理并首次上传到 GitHub。

## 1. 决定仓库信息

- 确认项目最终名称是否继续使用“字场 ZICHANG”。
- 准备一句简短的仓库描述。
- 选择公开仓库或私有仓库。
- 选择开源许可证；如果暂时不希望他人复用，可以先保持无许可证状态。
- 确定 GitHub 用户名或组织名以及仓库名。

推荐仓库描述：

```text
为中文界面而生的 React 动态文字效果组件库。
```

推荐 Topics：

```text
react typescript text-animation typography chinese-ui css-animation component-library
```

## 2. 发布前本地检查

```bash
npm install
npm run lint
npm run check:registry
npm run build:distribution
npm run check:bundles
npm test
npm run test:interaction-css
npm run test:typewriter
```

源码目录结构、隔离类型检查与 Registry 状态参见 [本地分发说明](./DISTRIBUTION.md)。两个浏览器命令需要本机 Chromium，可通过 `TEXT_EFFECT_TEST_BROWSER` 指定路径。

然后运行 `npm run dev`，检查：

- <http://localhost:3000>
- <http://localhost:3000/docs>

## 3. 补充许可证

当前仓库没有 `LICENSE`。公开前需要根据实际意图选择：

- MIT：允许广泛复用，要求保留版权和许可声明。
- Apache-2.0：允许广泛复用，并包含明确的专利授权条款。
- 暂不添加：他人默认不能合法复制、修改或再发布代码。

许可证会改变他人使用代码的权利，不建议在未确认前自动添加。

## 4. 创建 GitHub 仓库

在 GitHub 创建空仓库时，不要额外初始化 README、`.gitignore` 或许可证，以免与本地文件冲突。

创建后，按 GitHub 显示的仓库地址执行：

```bash
git add .
git commit -m "feat: initial release of ZICHANG"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

如果使用 SSH：

```bash
git remote add origin git@github.com:你的用户名/仓库名.git
git push -u origin main
```

## 5. 上传后的设置

- 在仓库 About 中填写描述和 Topics。
- 启用 Issues。
- 在 Security 设置中启用 Private vulnerability reporting。
- 根据需要开启 Discussions。
- 为 `main` 分支配置保护规则和 Pull Request 检查。
- 把正式仓库地址补充到 `package.json`。
- 把 `registry.json` 的 `homepage` 从本地地址改为正式网站地址。

## 6. 公开网站准备

公开网站发布前还需要：

- 配置正式域名或托管地址
- 增加社交分享图片和 Open Graph 元数据
- 替换页面中仍指向本地环境的安装说明
- 验证手机端、键盘操作和主要浏览器
- 配置 GitHub Actions 自动运行 `npm run lint` 与 `npm test`
