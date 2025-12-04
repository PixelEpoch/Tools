#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

// 扫描JAR文件
function scanJarFiles(directory) {
  const jarFiles = [];
  
  function scan(dir) {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          scan(filePath);
        } else if (file.isFile() && file.name.toLowerCase().endsWith('.jar')) {
          const stats = fs.statSync(filePath);
          jarFiles.push({
            path: filePath,
            name: file.name,
            size: stats.size,
            mtime: stats.mtime,
            atime: stats.atime,
            ctime: stats.ctime
          });
        }
      }
    } catch (error) {
      console.error(`❌ 扫描目录 ${dir} 失败:`, error.message);
    }
  }
  
  scan(directory);
  return jarFiles;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 检查Java环境
function checkJavaEnvironment() {
  return new Promise((resolve, reject) => {
    exec('java -version', (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        // Java版本信息在stderr中
        const versionInfo = stderr.toString();
        resolve(versionInfo);
      }
    });
  });
}

// 启动JAR文件
function startJarFile(jarPath) {
  return new Promise((resolve, reject) => {
    let command;
    
    switch (process.platform) {
      case 'win32':
        command = `java -jar "${jarPath}"`;
        break;
      case 'darwin':
      case 'linux':
        command = `java -jar "${jarPath}"`;
        break;
      default:
        reject(new Error(`❌ 不支持的操作系统: ${process.platform}`));
        return;
    }
    
    console.log('\n🚀 正在启动JAR文件...');
    console.log(`📌 JAR路径: ${jarPath}`);
    console.log(`💻 执行命令: ${command}`);
    console.log('=' .repeat(80));
    
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`❌ 启动失败: ${error.message}`));
        return;
      }
      resolve({ stdout, stderr });
    });
    
    // 将子进程的输出实时打印到控制台
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
}

// 显示JAR文件列表（美化版）
function displayJarList(jarFiles) {
  console.log('\n📦 找到的JAR文件:');
  console.log('=' .repeat(80));
  jarFiles.forEach((jar, index) => {
    console.log(`\n${index + 1}. 📄 ${jar.name}`);
    console.log(`   📁 路径: ${jar.path}`);
    console.log(`   📊 大小: ${formatFileSize(jar.size)}`);
    console.log(`   ⏰ 修改时间: ${jar.mtime.toLocaleString()}`);
  });
  console.log('\n' + '=' .repeat(80));
}

// 10秒倒计时函数
function countdown(seconds, onComplete) {
  let remaining = seconds;
  
  const timer = setInterval(() => {
    if (remaining > 0) {
      process.stdout.write(`\r⏳ 即将启动第一个JAR文件，倒计时 ${remaining} 秒... (按 Ctrl+C 取消)`);
      remaining--;
    } else {
      clearInterval(timer);
      process.stdout.write('\r✅ 倒计时结束，开始启动JAR文件！           \n');
      onComplete();
    }
  }, 1000);
  
  // 初始化显示
  process.stdout.write(`\r⏳ 即将启动第一个JAR文件，倒计时 ${remaining} 秒... (按 Ctrl+C 取消)`);
}

// 命令行交互界面（带倒计时）
async function cli() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // 检查Java环境
  const javaInfo = await checkJavaEnvironment();
  if (!javaInfo) {
    console.error('❌ 错误: 未检测到Java环境，请先安装Java Runtime Environment');
    rl.close();
    process.exit(1);
  } else {
    console.log('✅ Java环境检测成功:');
    console.log(javaInfo.trim());
  }
  
  // 扫描当前目录下的JAR文件
  const currentDir = process.cwd();
  console.log(`\n🔍 正在扫描目录: ${currentDir}`);
  const jarFiles = scanJarFiles(currentDir);
  
  if (jarFiles.length === 0) {
    console.log('❌ 未找到任何JAR文件');
    rl.close();
    return;
  }
  
  displayJarList(jarFiles);
  
  // 10秒倒计时自动启动第一个JAR文件
  countdown(10, async () => {
    try {
      await startJarFile(jarFiles[0].path);
    } catch (error) {
      console.error('\n❌ 启动失败:', error.message);
    } finally {
      rl.close();
    }
  });
  
  // 监听Ctrl+C取消
  process.on('SIGINT', () => {
    console.log('\n\n❌ 已取消启动');
    rl.close();
    process.exit(0);
  });
}

// 处理命令行参数
function handleCommandLineArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 无参数，启动交互模式（带倒计时）
    cli();
    return;
  }
  
  // 处理命令行参数
  const options = {
    scan: false,
    start: null
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--scan':
      case '-s':
        options.scan = true;
        break;
        
      case '--start':
      case '-r':
        options.start = args[++i] || null;
        break;
        
      case '--help':
      case '-h':
        console.log('🟢 JAR Launcher 使用帮助:');
        console.log('  node index.js [选项]');
        console.log('');
        console.log('选项:');
        console.log('  --scan, -s         🔍 扫描当前目录下的JAR文件');
        console.log('  --start <path>, -r <path>  🚀 启动指定路径的JAR文件');
        console.log('  --help, -h         ❓ 显示帮助信息');
        process.exit(0);
        break;
        
      default:
        console.error(`❌ 未知选项: ${arg}`);
        console.error('使用 --help 查看帮助信息');
        process.exit(1);
    }
  }
  
  // 执行相应操作
  if (options.scan) {
    const currentDir = process.cwd();
    console.log(`🔍 正在扫描目录: ${currentDir}`);
    const jarFiles = scanJarFiles(currentDir);
    displayJarList(jarFiles);
    process.exit(0);
  }
  
  if (options.start) {
    checkJavaEnvironment().then(javaInfo => {
      if (!javaInfo) {
        console.error('❌ 错误: 未检测到Java环境，请先安装Java Runtime Environment');
        process.exit(1);
      }
      
      startJarFile(options.start).catch(error => {
        console.error('❌ 启动失败:', error.message);
        process.exit(1);
      });
    });
  }
}

// 主函数
function main() {
  console.log('🎯' + '=' .repeat(78) + '🎯');
  console.log('🚀 JAR Launcher - 跨平台JAR文件管理工具 🚀');
  console.log('🎯' + '=' .repeat(78) + '🎯');
  console.log('📝 自动扫描JAR文件，10秒后启动第一个文件');
  console.log('⌨️  支持命令行参数，使用 --help 查看帮助\n');
  
  handleCommandLineArgs();
}

// 启动应用
main();
