# EffiKit 更新日志

所有重要的项目变更都会记录在此文件中。

日志格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本控制遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 完整的 GitHub Release 自动化发布流程
- 版本管理和同步脚本
- 自动化构建和部署工作流

## [0.0.1] - 2024-09-14

### 新增
- 🎨 网页高亮标记功能
- 🌈 多色彩高亮支持（黄色、绿色、蓝色、粉色、紫色）
- ☁️ Supabase 云端同步功能
- 💾 Chrome Storage API 本地存储备份
- 📱 React 侧边栏管理界面
- 🔒 Shadow DOM 样式隔离技术
- 🌐 跨网站兼容性支持
- ⚙️ Chrome Manifest V3 架构

### 技术特性
- **前端框架**: React 18 + TypeScript
- **状态管理**: React Hooks + 自定义存储钩子
- **样式系统**: Tailwind CSS + shadcn/ui 组件
- **存储架构**: 适配器模式，支持 Supabase 和 Chrome Storage 双后端
- **构建工具**: Extension.js（基于 webpack）
- **代码质量**: ESLint + TypeScript + Husky + lint-staged

### 架构亮点
- Custom Elements + React 混合架构实现样式隔离
- 存储系统支持优雅降级（Supabase → Chrome Storage）
- 事件驱动的组件通信模式
- 完整的 Chrome 扩展生命周期管理

---

## 发布说明

### 安装方式
1. 从 [GitHub Releases](https://github.com/edisonLzy/effikit/releases) 下载最新版本的 `.zip` 文件
2. 解压到本地文件夹
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 开启「开发者模式」
5. 点击「加载已解压的扩展程序」，选择解压后的文件夹

### 使用方法
1. 在任意网页上选中文本
2. 使用右键菜单或快捷键进行高亮标记
3. 点击浏览器工具栏中的 EffiKit 图标打开侧边栏
4. 在侧边栏中管理所有高亮内容

### 反馈与支持
如有问题或建议，请在 [GitHub Issues](https://github.com/edisonLzy/effikit/issues) 中提交。