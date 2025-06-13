# effikit

> An Extension.js example.

## Available Scripts

In the project directory, you can run the following scripts:

### pnpm dev

**Development Mode**: This command runs your extension in development mode. It will launch a new browser instance with your extension loaded. The page will automatically reload whenever you make changes to your code, allowing for a smooth development experience.

```bash
pnpm dev
```

### pnpm start

**Production Preview**: This command runs your extension in production mode. It will launch a new browser instance with your extension loaded, simulating the environment and behavior of your extension as it will appear once published.

```bash
pnpm start
```

### pnpm build

**Build for Production**: This command builds your extension for production. It optimizes and bundles your extension, preparing it for deployment to the target browser's store.

```bash
pnpm build
```

## Learn More

To learn more about creating cross-browser extensions with Extension.js, visit the [official documentation](https://extension.js.org).

## 变更记录（最近一次提交）

- 更新 .gitignore、package.json、pnpm-lock.yaml
- 新增 .env.example、.taskmaster/ 目录及相关配置文件
- 适配 MacBook Pro (M3/16GB) 本地 Ollama Qwen 模型推荐说明

```shell
pnpm task-master models --ollama --set-research qwen3:4b
```

- 添加 Taskmaster 相关开发与管理文件
- 详见提交历史与各配置文件内容
