# JAR Launcher - Cross-platform JAR File Management Tool

## Features

JAR Launcher is a Node.js-based cross-platform tool for scanning, managing, and launching JAR files. It provides the following features:

- **File Scanning**: Recursively scans current directory and subdirectories for all JAR files
- **JAR Management**: Command-line interface supporting JAR file selection, batch operations, and frequently used JAR memory
- **Cross-platform Launch**: Uses appropriate commands to launch JAR files based on different operating systems
- **Configuration Saving**: Automatically remembers frequently used JAR files, supports favorites functionality
- **Command-line Parameters**: Supports automated running and batch operations

## Supported Platforms

- macOS (ARM64 and x64)
- Windows (x64)
- Linux (x64 and ARM64)

## Installation and Usage

### Method 1: Run directly with Node.js

1. Ensure Node.js 18.x or higher is installed
2. Clone or download this project
3. Run in the project directory:
   ```bash
   node index.js
   ```

### Method 2: Use executable file (Recommended)

#### macOS Users

1. Download the executable for your architecture:
   - ARM64 (M1/M2/M3): `jar-launcher-arm64`
   - x64 (Intel): `jar-launcher-x64`

2. Grant execution permission:
   ```bash
   chmod +x jar-launcher-arm64  # or jar-launcher-x64
   ```

3. Run:
   ```bash
   ./jar-launcher-arm64  # or ./jar-launcher-x64
   ```

#### Windows/Linux Users

Please refer to the "Build Guide" section to build the executable file on your platform.

## Command-line Options

```
JAR Launcher - Cross-platform JAR File Management Tool

Options:
  --scan, -s         Scan for JAR files in current directory
  --start <path>, -r <path>  Launch JAR file at specified path
  --favorites, -f    Display favorite JAR files
  --help, -h         Display help information
```

## Usage Examples

### 1. Interactive Mode

Run the program directly to enter interactive mode:
```bash
node index.js
```

### 2. Scan JAR Files

```bash
node index.js --scan
```

### 3. Directly Launch JAR File

```bash
node index.js --start ./path/to/your/file.jar
```

### 4. View Favorite JAR Files

```bash
node index.js --favorites
```

## Build Guide

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Install Dependencies

```bash
npm install -g pkg
```

### Build on macOS

```bash
# Build executable files for macOS platform
npm run build
```

### Build on Windows

```bash
# Build executable file for Windows platform
npm run build:win
```

### Build on Linux

```bash
# Build executable files for Linux platform
npm run build:linux
```

### Build Results

After successful build, executable files will be generated in the `dist/` directory:

- macOS ARM64: `dist/jar-launcher-arm64`
- macOS x64: `dist/jar-launcher-x64`
- Windows x64: `dist/jar-launcher.exe`
- Linux x64: `dist/jar-launcher-linux-x64`
- Linux ARM64: `dist/jar-launcher-linux-arm64`

## Configuration File

The program will generate a `.jar-launcher-config.json` configuration file in the current directory to save:

- Recently used JAR file paths
- Favorite JAR file list

## Error Handling

The program includes comprehensive error handling mechanisms, including:

- Java environment not installed detection
- JAR file not found detection
- Permission error handling
- Operating system compatibility check

## System Requirements

- **Java Environment**: Java Runtime Environment (JRE) 8 or higher is required
- **Node.js**: Node.js 18.x or higher is required for development and runtime
- **Operating System**: Supports Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+, CentOS 7+)

## Development Notes

### Project Structure

```
jar-launcher/
├── index.js          # Main program file
├── package.json      # Project configuration
├── README.md         # Documentation
└── dist/             # Build output directory
```

### Main Functional Modules

1. **File Scanning Module**: Recursively scans directories for JAR files
2. **Configuration Management Module**: Reads and saves configuration files
3. **Command-line Interaction Module**: Provides interactive operation interface
4. **JAR Launch Module**: Launches JAR files according to operating system
5. **Error Handling Module**: Handles various exception cases

## License

ISC License

## Changelog

### v1.0.0

- Initial version
- Implemented JAR file scanning and launching functionality
- Supported command-line parameters and interactive operations
- Supported macOS platform building
- Supported configuration saving and favorites functionality
