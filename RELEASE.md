# EffiKit Chrome 扩展发布流程

## 📋 自动化发布流程已配置完成

### 🚀 发布方式

#### 方式一：标签触发（推荐）
```bash
# 1. 更新版本号（自动同步到 manifest.json）
pnpm version:patch  # 补丁版本 0.0.1 -> 0.0.2
pnpm version:minor  # 次版本 0.0.1 -> 0.1.0
pnpm version:major  # 主版本 0.0.1 -> 1.0.0

# 2. 推送标签到 GitHub（自动触发构建和发布）
pnpm release:push
```

#### 方式二：手动触发
1. 访问 GitHub Actions 页面
2. 选择 "Release" 工作流
3. 点击 "Run workflow"
4. 输入版本号（如：v1.0.0）
5. 点击运行

### 📦 发布内容

发布包含以下内容：
- `effikit-extension-vX.X.X.zip` - Chrome 扩展安装包
- 自动生成的发布说明
- 安装指南
- 技术规格说明

### 🔧 版本管理

- **package.json** - 主版本号管理
- **manifest.json** - 自动同步版本号
- **CHANGELOG.md** - 手动更新变更日志

### 📥 用户安装步骤

1. 从 GitHub Releases 下载 `.zip` 文件
2. 解压到本地文件夹
3. 打开 Chrome 浏览器：`chrome://extensions/`
4. 开启「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的文件夹

### 🛠️ 开发者工具

```bash
# 开发模式
pnpm dev

# 构建扩展
pnpm build

# 代码检查
pnpm lint
pnpm lint:fix

# 版本同步
pnpm version:sync

# 发布准备（检查 + 构建）
pnpm release:prepare
```

### ⚠️ 注意事项

1. 确保所有代码已提交并推送到远程仓库
2. 发布前运行 `pnpm release:prepare` 检查代码质量
3. 更新 `CHANGELOG.md` 记录新版本的变更
4. 版本号遵循语义化版本规范
5. 标签推送后会自动触发构建，无需手动干预

### 🔄 工作流状态

可以在以下位置查看发布状态：
- GitHub Actions 页面：查看构建进度
- GitHub Releases 页面：查看发布结果
- 构建失败时会收到邮件通知

---

## 🎯 快速发布指南

```bash
# 一键发布补丁版本
pnpm version:patch && pnpm release:push

# 一键发布次版本
pnpm version:minor && pnpm release:push

# 一键发布主版本
pnpm version:major && pnpm release:push
```