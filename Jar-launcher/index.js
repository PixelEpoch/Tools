#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');
const chalk = require('chalk');
const boxen = require('boxen');
const Table = require('cli-table3');
const ora = require('ora');

// 配置chalk，确保兼容Windows
chalk.level = 2;

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
      console.error(`[ERROR] 扫描目录 ${dir} 失败:`, error.message);
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
    const spinner = ora('正在检查Java环境...').start();
    
    exec('java -version', (error, stdout, stderr) => {
      if (error) {
        spinner.fail(chalk.red('未检测到Java环境'));
        resolve(false);
      } else {
        // Java版本信息在stderr中
        const versionInfo = stderr.toString();
        spinner.succeed(chalk.green('Java环境检测成功'));
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
        reject(new Error(`[ERROR] Unsupported operating system: ${process.platform}`));
        return;
    }
    
    const startInfo = boxen(
      chalk.green.bold('[START] Starting JAR File...') + '\n' +
      chalk.blue(`[PATH] JAR Path: ${jarPath}`) + '\n' +
      chalk.yellow(`[CMD] Command: ${command}`),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'green',
        margin: 1
      }
    );
    
    console.log('\n' + '=' .repeat(80));
    console.log(startInfo);
    console.log('=' .repeat(80));
    
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`[ERROR] Failed to start: ${error.message}`));
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
  console.log('\n' + chalk.yellow.bold('='.repeat(120)));
  console.log(' ' .repeat(50) + chalk.yellow.bold('[LIST] 找到的JAR文件'));
  console.log(chalk.yellow.bold('='.repeat(120)));
  
  const table = new Table({
    head: ['序号', '名称', '大小', '修改时间', '路径'],
    colWidths: [8, 35, 18, 32, 70],
    style: {
      head: ['brightCyan', 'bold'],
      border: ['gray'],
      compact: false,
      colAligns: ['center', 'left', 'right', 'center', 'left']
    },
    chars: {
      'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
      'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
      'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
      'right': '║', 'right-mid': '╢', 'middle': '│'
    }
  });
  
  jarFiles.forEach((jar, index) => {
    // 交替行背景色
    const rowStyle = index % 2 === 0 ? chalk.white : chalk.gray;
    
    table.push([
      rowStyle(chalk.bold(index + 1)),
      rowStyle(chalk.green(jar.name)),
      rowStyle(chalk.yellow.bold(formatFileSize(jar.size))),
      rowStyle(chalk.blue(jar.mtime.toLocaleString())),
      rowStyle(chalk.magenta(jar.path))
    ]);
  });
  
  console.log(table.toString());
  console.log(chalk.yellow.bold('='.repeat(120)));
}

// 10秒倒计时函数
function countdown(seconds, onComplete) {
  let remaining = seconds;
  
  const spinner = ora({
    text: chalk.yellow(`即将启动第一个JAR文件，倒计时 ${remaining} 秒... (按 Ctrl+C 取消)`),
    spinner: 'clock'
  }).start();
  
  const timer = setInterval(() => {
    if (remaining > 0) {
      remaining--;
      spinner.text = chalk.yellow(`即将启动第一个JAR文件，倒计时 ${remaining} 秒... (按 Ctrl+C 取消)`);
    } else {
      clearInterval(timer);
      spinner.succeed(chalk.green('倒计时结束，开始启动JAR文件！'));
      onComplete();
    }
  }, 1000);
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
    console.error(chalk.red('[ERROR] Error: Java Runtime Environment not detected, please install JRE first'));
    rl.close();
    process.exit(1);
  } else {
    console.log(chalk.green('[OK] Java environment details:'));
    console.log(chalk.gray(javaInfo.trim()));
  }
  
  // 扫描当前目录下的JAR文件
  const currentDir = process.cwd();
  const scanSpinner = ora(chalk.blue(`[SCAN] 正在扫描目录: ${currentDir}`)).start();
  const jarFiles = scanJarFiles(currentDir);
  scanSpinner.succeed(chalk.blue(`[SCAN] 扫描完成，找到 ${jarFiles.length} 个JAR文件`));
  
  if (jarFiles.length === 0) {
    console.log(chalk.yellow('[INFO] 未找到任何JAR文件'));
    rl.close();
    return;
  }
  
  displayJarList(jarFiles);
  
  // 添加选择功能
  console.log('\n' + chalk.yellow.bold('请选择要执行的操作:'));
  console.log(chalk.green('1 - ') + chalk.yellow('启动指定JAR文件'));
  console.log(chalk.green('2 - ') + chalk.yellow('5秒后自动启动第一个JAR文件'));
  console.log(chalk.green('3 - ') + chalk.yellow('退出程序'));
  console.log(chalk.red('\n[INFO] 如果5秒内未选择，将自动启动第一个JAR文件'));
  console.log('');
  
  // 5秒超时自动启动第一个JAR文件
  const timeoutId = setTimeout(async () => {
    console.log('\n[INFO] 5秒内未选择，自动启动第一个JAR文件...');
    try {
      await startJarFile(jarFiles[0].path);
    } catch (error) {
      console.error(chalk.red('\n[ERROR] 启动失败:', error.message));
    } finally {
      rl.close();
    }
  }, 5000);
  
  rl.question(chalk.cyan('请输入选项 (1-3): '), async (answer) => {
    // 清除超时定时器
    clearTimeout(timeoutId);
    
    switch (answer.trim()) {
      case '1':
        // 选择要启动的JAR文件
        rl.question(chalk.cyan('请输入要启动的JAR文件序号: '), async (jarIndex) => {
          const index = parseInt(jarIndex.trim()) - 1;
          if (index >= 0 && index < jarFiles.length) {
            try {
              await startJarFile(jarFiles[index].path);
            } catch (error) {
              console.error('\n[ERROR] 启动失败:', error.message);
            } finally {
              rl.close();
            }
          } else {
            console.error('\n[ERROR] 无效的JAR文件序号');
            rl.close();
          }
        });
        break;
        
      case '2':
        // 5秒倒计时自动启动第一个JAR文件
        countdown(5, async () => {
          try {
            await startJarFile(jarFiles[0].path);
          } catch (error) {
            console.error('\n[ERROR] 启动失败:', error.message);
          } finally {
            rl.close();
          }
        });
        break;
        
      case '3':
        // 退出程序
        console.log('\n[INFO] 程序已退出');
        rl.close();
        process.exit(0);
        break;
        
      default:
        console.error('\n[ERROR] 无效的选项');
        rl.close();
        break;
    }
  });
  
  // 监听Ctrl+C取消
  process.on('SIGINT', () => {
    console.log('\n\n[CANCEL] 已取消启动');
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
        console.log(chalk.green.bold('[HELP] JAR Launcher 使用帮助:'));
        console.log('  node index.js [选项]');
        console.log('');
        console.log(chalk.yellow('选项:'));
        console.log('  --scan, -s         ' + chalk.blue('[SCAN]') + ' 扫描当前目录下的JAR文件');
        console.log('  --start <path>, -r <path>  ' + chalk.blue('[START]') + ' 启动指定路径的JAR文件');
        console.log('  --help, -h         ' + chalk.blue('[HELP]') + ' 显示帮助信息');
        process.exit(0);
        break;
        
      default:
        console.error(chalk.red(`[ERROR] 未知选项: ${arg}`));
        console.error(chalk.yellow('使用 --help 查看帮助信息'));
        process.exit(1);
    }
  }
  
  // 执行相应操作
  if (options.scan) {
    const currentDir = process.cwd();
    const scanSpinner = ora(chalk.blue(`[SCAN] 正在扫描目录: ${currentDir}`)).start();
    const jarFiles = scanJarFiles(currentDir);
    scanSpinner.succeed(chalk.blue(`[SCAN] 扫描完成，找到 ${jarFiles.length} 个JAR文件`));
    displayJarList(jarFiles);
    process.exit(0);
  }
  
  if (options.start) {
    checkJavaEnvironment().then(javaInfo => {
      if (!javaInfo) {
        console.error('[ERROR] 错误: 未检测到Java环境，请先安装Java Runtime Environment');
        process.exit(1);
      }
      
      startJarFile(options.start).catch(error => {
        console.error('[ERROR] 启动失败:', error.message);
        process.exit(1);
      });
    });
  }
}

// 主函数
function main() {
  const header = boxen(
    chalk.green.bold('JAR Launcher') + ' - 跨平台JAR文件管理工具',
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
      backgroundColor: '#f0f0f0'
    }
  );
  
  console.log(header);
  console.log(chalk.blue('[INFO]') + ' 自动扫描JAR文件，10秒后启动第一个文件');
  console.log(chalk.blue('[INFO]') + ' 支持命令行参数，使用 --help 查看帮助\n');
  
  handleCommandLineArgs();
}

// 启动应用
main();
