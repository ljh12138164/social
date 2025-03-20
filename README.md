# Website Monorepo

这是一个基于pnpm workspace的monorepo项目，集成了现代前端开发最佳实践。

## 技术栈

- 包管理器: pnpm + workspace
- 构建工具: Turborepo
- 代码规范: Biome
- 主要框架: Next.js
- 类型检查: TypeScript

## 项目结构

```
.
├── apps/               # 应用程序
│   └── web/           # Next.js 主应用
├── packages/          # 共享包
│   ├── biome-config/  # Biome 配置
│   ├── config/        # 项目配置
│   ├── lib/          # 通用工具库
│   └── ui/           # UI 组件库
└── server/           # 服务端应用
    └── api/          # API 服务
```

## 开发指南

### 环境准备

1. 安装 Node.js (推荐 v18+)
2. 安装 pnpm: `npm install -g pnpm`

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 启动所有应用
pnpm dev

# 构建所有应用
pnpm build

# 代码检查
pnpm lint
```

## 子包说明

### apps/web

主要的 Next.js 应用程序，包含了项目的核心功能和页面。

### packages/ui

共享 UI 组件库，提供了可复用的界面组件。

### packages/lib

通用工具库，包含了各种辅助函数和工具方法。

### packages/config

共享配置文件，包含了 TypeScript、构建工具等配置。

### packages/biome-config

Biome 代码规范配置。

### server/api

API 服务端应用。

## 贡献指南

1. Fork 本仓库
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT