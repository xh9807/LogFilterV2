# HiLog 日志过滤器

一个基于 Electron + React + TypeScript 开发的跨平台桌面应用，用于解析和过滤鸿蒙 HiLog 日志文件。

## 功能特性

- ✅ 跨平台支持（Windows / macOS / Linux）
- 📁 支持选择单个文件或整个文件夹
- 🔍 支持精确的时间过滤（毫秒级精度）
- 🎯 支持按日志等级、Tag、关键词过滤
- 📊 日志统计信息展示
- 💾 支持导出过滤后的日志
- ⚡ 高性能处理大文件（流式读取）
- 🎨 美观的用户界面（Ant Design 5）

## 技术栈

- **桌面框架**: Electron 28+
- **前端框架**: React 18
- **开发语言**: TypeScript
- **UI组件库**: Ant Design 5
- **状态管理**: Zustand
- **虚拟列表**: react-window
- **构建工具**: Vite + electron-builder

## 开发环境

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
npm run electron:build
```

## 项目结构

```
LogFilterV2/
├── electron/                 # Electron主进程代码
│   ├── main/                # 主进程
│   │   └── index.ts         # 入口文件
│   ├── preload/             # 预加载脚本
│   │   └── index.ts
│   └── tsconfig.json        # TS配置
├── src/                     # React前端代码
│   ├── components/          # UI组件
│   ├── hooks/               # 自定义Hooks
│   ├── store/               # 状态管理
│   ├── utils/               # 工具函数
│   ├── types/               # 类型定义
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── docs/                    # 文档
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## HiLog 日志格式

本工具支持解析标准 HiLog 日志格式：

```
01-16 14:42:52.788 62125 62125 I A03D00/com.jd.hm.mall/JSAPP: [[1,"banneractiveIndex",1.0]]
└─┬─┘ └───┬───┘ └─┬─┘ └─┬─┘ └─┬─┘ └─────────────┬─────────────┘ └───────┬───────┘
 日期      时间    PID   TID  等级       Tag                   Content
```

### 字段说明

- **日期**: MM-dd 格式（月-日）
- **时间**: HH:mm:ss.SSS 格式（时:分:秒.毫秒）
- **PID**: 进程ID
- **TID**: 线程ID
- **等级**: V(Verbose) / D(Debug) / I(Info) / W(Warn) / E(Error) / F(Fatal)
- **Tag**: 日志标签
- **Content**: 日志内容

## 使用说明

1. 启动应用
2. 点击"选择文件"或"选择文件夹"按钮
3. 选择包含 HiLog 日志的 .txt 或 .json 文件
4. 设置过滤条件（起始时间、结束时间、等级等）
5. 点击"开始过滤"按钮
6. 查看过滤结果并可以导出

## 性能优化

- 使用流式读取处理大文件（避免内存溢出）
- 使用虚拟滚动渲染大量日志（支持10万+条日志）
- 使用 Web Worker 进行日志解析（避免阻塞UI）
- 批量IPC通信（减少进程间通信开销）

## 文件大小限制

- 单个文件最大支持 100MB
- 超过限制的文件将被自动跳过并提示

## 许可证

MIT License

## 作者

Your Name

## 更新日志

### v1.0.0 (2026-02-27)
- 初始版本发布
- 支持基础的日志解析和过滤功能
