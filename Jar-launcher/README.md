# JAR Launcher - 跨平台JAR文件管理工具

## 功能介绍

JAR Launcher是一个基于Node.js开发的跨平台工具，用于扫描、管理和启动JAR文件。它提供了以下功能：

- 🔍 **文件扫描**：递归扫描当前目录及其子目录下的所有JAR文件
- 📋 **JAR管理**：命令行界面，支持选择启动JAR文件，批量操作和常用JAR记忆
- 🚀 **跨平台启动**：根据不同操作系统使用相应命令启动JAR文件
- 💾 **配置保存**：自动记忆常用JAR文件，支持收藏功能
- 🎯 **命令行参数**：支持自动化运行和批量操作

## 支持的平台

- macOS (ARM64 和 x64)
- Windows (x64)
- Linux (x64 和 ARM64)

## 安装和使用

### 方法1：直接使用Node.js运行

1. 确保已安装Node.js 18.x或更高版本
2. 克隆或下载本项目
3. 在项目目录中运行：
   ```bash
   node index.js
   ```

### 方法2：使用可执行文件（推荐）

#### macOS用户

1. 下载对应架构的可执行文件：
   - ARM64 (M1/M2/M3)：`jar-launcher-arm64`
   - x64 (Intel)：`jar-launcher-x64`

2. 赋予执行权限：
   ```bash
   chmod +x jar-launcher-arm64  # 或 jar-launcher-x64
   ```

3. 运行：
   ```bash
   ./jar-launcher-arm64  # 或 ./jar-launcher-x64
   ```

#### Windows/Linux用户

请参考「构建指南」部分，在对应平台上构建可执行文件。

## 命令行选项

```
JAR Launcher - 跨平台JAR文件管理工具

选项：
  --scan, -s         扫描当前目录下的JAR文件
  --start <path>, -r <path>  启动指定路径的JAR文件
  --favorites, -f    显示收藏的JAR文件
  --help, -h         显示帮助信息
```

## 使用示例

### 1. 交互式模式

直接运行程序，进入交互式界面：
```bash
node index.js
```

### 2. 扫描JAR文件

```bash
node index.js --scan
```

### 3. 直接启动JAR文件

```bash
node index.js --start ./path/to/your/file.jar
```

### 4. 查看收藏的JAR文件

```bash
node index.js --favorites
```

## 构建指南

### 前提条件

- Node.js 18.x或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install -g pkg
```

### 在macOS上构建

```bash
# 构建macOS平台的可执行文件
npm run build
```

### 在Windows上构建

```bash
# 构建Windows平台的可执行文件
npm run build:win
```

### 在Linux上构建

```bash
# 构建Linux平台的可执行文件
npm run build:linux
```

### 构建结果

构建成功后，可执行文件将生成在 `dist/` 目录中：

- macOS ARM64: `dist/jar-launcher-arm64`
- macOS x64: `dist/jar-launcher-x64`
- Windows x64: `dist/jar-launcher.exe`
- Linux x64: `dist/jar-launcher-linux-x64`
- Linux ARM64: `dist/jar-launcher-linux-arm64`

## 配置文件

程序会在当前目录下生成 `.jar-launcher-config.json` 配置文件，用于保存：

- 最近使用的JAR文件路径
- 收藏的JAR文件列表

## 错误处理

程序包含完善的错误处理机制，包括：

- Java环境未安装检测
- JAR文件不存在检测
- 权限不足处理
- 操作系统兼容性检查

## 系统要求

- **Java环境**：需要安装Java Runtime Environment (JRE) 8或更高版本
- **Node.js**：开发和运行时需要Node.js 18.x或更高版本
- **操作系统**：支持Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+, CentOS 7+)

## 开发说明

### 项目结构

```
jar-launcher/
├── index.js          # 主程序文件
├── package.json      # 项目配置
├── README.md         # 说明文档
└── dist/             # 构建输出目录
```

### 主要功能模块

1. **文件扫描模块**：递归扫描目录下的JAR文件
2. **配置管理模块**：读取和保存配置文件
3. **命令行交互模块**：提供交互式操作界面
4. **JAR启动模块**：根据操作系统启动JAR文件
5. **错误处理模块**：处理各种异常情况

## 许可证

ISC License

## 更新日志

### v1.0.0

- 初始版本
- 实现JAR文件扫描和启动功能
- 支持命令行参数和交互式操作
- 支持macOS平台构建
- 支持配置保存和收藏功能
