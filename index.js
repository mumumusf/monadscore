/**
 * @author 小林
 * @description MondaScore平台自动化工具
 * 主要功能：
 * 1. 自动执行任务
 * 2. 自动启动节点
 * 3. 获取积分统计
 * 4. 支持代理配置
 */

import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';
import { Wallet } from 'ethers';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import banner from './banner.js';

/**
 * 延迟函数
 * @param {number} seconds 延迟秒数
 * @returns {Promise} 延迟Promise
 */
function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * 文本居中显示函数
 * @param {string} text 要显示的文本
 * @param {string} color 文本颜色
 * @returns {string} 居中后的文本
 */
function centerText(text, color = 'greenBright') {
  const terminalWidth = process.stdout.columns || 80;
  const textLength = text.length;
  const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
  return ' '.repeat(padding) + chalk[color](text);
}

// 用户代理列表
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/102.0'
];

/**
 * 获取随机User-Agent
 * @returns {string} 随机User-Agent
 */
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * 获取请求头
 * @returns {Object} 请求头对象
 */
function getHeaders() {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'origin': 'https://monadscore.xyz',
    'referer': 'https://monadscore.xyz/'
  };
}

/**
 * 获取Axios配置
 * @param {string} proxy 代理地址
 * @returns {Object} Axios配置对象
 */
function getAxiosConfig(proxy) {
  const config = {
    headers: getHeaders(),
    timeout: 60000
  };
  if (proxy) {
    config.httpsAgent = newAgent(proxy);
  }
  return config;
}

/**
 * 创建代理代理
 * @param {string} proxy 代理地址
 * @returns {Object} 代理代理对象
 */
function newAgent(proxy) {
  if (proxy.startsWith('http://')) {
    return new HttpsProxyAgent(proxy);
  } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
    return new SocksProxyAgent(proxy);
  } else {
    console.log(chalk.red(`不支持的代理类型: ${proxy}`));
    return null;
  }
}

/**
 * 带重试机制的请求函数
 * @param {string} method 请求方法
 * @param {string} url 请求URL
 * @param {Object} payload 请求数据
 * @param {Object} config 请求配置
 * @param {number} retries 重试次数
 * @param {number} backoff 重试延迟
 * @returns {Promise} 请求结果
 */
async function requestWithRetry(method, url, payload = null, config = null, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      let response;
      if (method === 'get') {
        response = await axios.get(url, config);
      } else if (method === 'post') {
        response = await axios.post(url, payload, config);
      } else if (method === 'put') {
        response = await axios.put(url, payload, config);
      } else {
        throw new Error(`不支持的方法: ${method}`);
      }
      return response;
    } catch (error) {
      if (i < retries - 1) {
        await delay(backoff / 1000);
        backoff *= 1.5;
        continue;
      } else {
        throw error;
      }
    }
  }
}

/**
 * 获取公网IP
 * @param {string} proxy 代理地址
 * @returns {Promise<string>} IP地址
 */
async function getPublicIP(proxy) {
  try {
    const response = await requestWithRetry('get', 'https://api.ipify.org?format=json', null, getAxiosConfig(proxy));
    if (response && response.data && response.data.ip) {
      return response.data.ip;
    } else {
      return 'IP未找到';
    }
  } catch (error) {
    return '获取IP失败';
  }
}

/**
 * 领取任务
 * @param {string} walletAddress 钱包地址
 * @param {string} taskId 任务ID
 * @param {string} proxy 代理地址
 * @returns {Promise<string>} 任务领取结果
 */
async function claimTask(walletAddress, taskId, proxy) {
  const url = 'https://mscore.onrender.com/user/claim-task';
  const payload = { wallet: walletAddress, taskId };
  try {
    const response = await requestWithRetry('post', url, payload, getAxiosConfig(proxy));
    return response.data && response.data.message
      ? response.data.message
      : '任务领取成功，但服务器未返回消息。';
  } catch (error) {
    return `任务 ${taskId} 失败: ${error.response?.data?.message || error.message}`;
  }
}

/**
 * 更新开始时间
 * @param {string} walletAddress 钱包地址
 * @param {string} proxy 代理地址
 * @returns {Promise<Object>} 更新结果
 */
async function updateStartTime(walletAddress, proxy) {
  const url = 'https://mscore.onrender.com/user/update-start-time';
  const payload = { wallet: walletAddress, startTime: Date.now() };
  try {
    const response = await requestWithRetry('put', url, payload, getAxiosConfig(proxy));
    const message = response.data && response.data.message ? response.data.message : '节点启动成功';
    const totalPoints =
      response.data && response.data.user && response.data.user.totalPoints !== undefined
        ? response.data.user.totalPoints
        : '未知';
    return { message, totalPoints };
  } catch (error) {
    const message = `节点启动失败: ${error.response?.data?.message || error.message}`;
    const totalPoints =
      error.response && error.response.data && error.response.data.user && error.response.data.user.totalPoints !== undefined
        ? error.response.data.user.totalPoints
        : 'N/A';
    return { message, totalPoints };
  }
}

/**
 * 处理单个账户
 * @param {Object} account 账户信息
 * @param {number} index 账户索引
 * @param {number} total 总账户数
 * @param {string} proxy 代理地址
 */
async function processAccount(account, index, total, proxy) {
  const { walletAddress, privateKey } = account;
  console.log(`\n`);
  console.log(chalk.bold.cyanBright('='.repeat(80)));
  console.log(chalk.bold.whiteBright(`账户: ${index + 1}/${total}`));
  console.log(chalk.bold.whiteBright(`钱包: ${walletAddress}`));
  const usedIP = await getPublicIP(proxy);
  console.log(chalk.bold.whiteBright(`使用的IP: ${usedIP}`));
  console.log(chalk.bold.cyanBright('='.repeat(80)));

  let wallet;
  try {
    wallet = new Wallet(privateKey);
  } catch (error) {
    console.error(chalk.red(`创建钱包错误: ${error.message}`));
    return;
  }

  const tasks = ['task003', 'task002', 'task001'];
  for (let i = 0; i < tasks.length; i++) {
    const spinnerTask = ora({ text: `正在领取任务 ${i + 1}/3 ...`, spinner: 'dots2', color: 'cyan' }).start();
    const msg = await claimTask(walletAddress, tasks[i], proxy);
    if (msg.toLowerCase().includes('successfully') || msg.toLowerCase().includes('berhasil')) {
      spinnerTask.succeed(chalk.greenBright(` 领取任务 ${i + 1}/3: ${msg}`));
    } else {
      spinnerTask.fail(chalk.red(` 领取任务 ${i + 1}/3: ${msg}`));
    }
  }

  const spinnerStart = ora({ text: '正在启动节点...', spinner: 'dots2', color: 'cyan' }).start();
  const { message, totalPoints } = await updateStartTime(walletAddress, proxy);
  if (message.toLowerCase().includes('successfully') || message.toLowerCase().includes('berhasil')) {
    spinnerStart.succeed(chalk.greenBright(` 节点启动成功: ${message}`));
  } else {
    spinnerStart.fail(chalk.red(` 节点启动失败: ${message}`));
  }

  const spinnerPoints = ora({ text: '正在获取总积分...', spinner: 'dots2', color: 'cyan' }).start();
  spinnerPoints.succeed(chalk.greenBright(` 总积分: ${totalPoints}`));
}

/**
 * 格式化代理地址
 * @param {string} proxyStr 代理字符串
 * @returns {string} 格式化后的代理地址
 */
function formatProxy(proxyStr) {
  // 如果已经是完整的代理URL，直接返回
  if (proxyStr.startsWith('http://') || proxyStr.startsWith('socks4://') || proxyStr.startsWith('socks5://')) {
    return proxyStr;
  }

  // 处理IP:PORT:USERNAME:PASSWORD格式
  const parts = proxyStr.split(':');
  if (parts.length === 4) {
    const [ip, port, username, password] = parts;
    return `http://${username}:${password}@${ip}:${port}`;
  }
  
  // 处理IP:PORT格式
  if (parts.length === 2) {
    const [ip, port] = parts;
    return `http://${ip}:${port}`;
  }

  return proxyStr;
}

/**
 * 提问函数
 * @param {string} query 问题
 * @returns {Promise<string>} 用户回答
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

/**
 * 获取用户输入的账号配置
 * @returns {Promise<Array>} 账号配置列表
 */
async function getAccountConfigs() {
  const accounts = [];
  let continueInput = true;

  while (continueInput) {
    console.log(chalk.cyan('\n============ 添加新账号 ============'));
    
    // 获取私钥
    const privateKey = await askQuestion('请输入钱包私钥 (输入空行结束): ');
    if (!privateKey) {
      continueInput = false;
      break;
    }

    // 验证私钥
    try {
      new Wallet(privateKey);
    } catch (error) {
      console.log(chalk.red('无效的私钥！跳过此账号。'));
      continue;
    }

    // 获取代理
    const proxyStr = await askQuestion('请输入代理地址 (支持格式: IP:PORT 或 IP:PORT:USERNAME:PASSWORD): ');
    let proxy = null;
    if (proxyStr) {
      proxy = formatProxy(proxyStr);
      console.log(chalk.blue(`使用代理: ${proxy}`));
    }

    // 创建钱包实例
    const wallet = new Wallet(privateKey);
    const walletAddress = wallet.address;
    console.log(chalk.green(`钱包地址: ${walletAddress}`));

    accounts.push({
      walletAddress,
      privateKey,
      proxy
    });

    console.log(chalk.green('账号添加成功！'));
  }

  return accounts;
}

/**
 * 主运行函数
 */
async function run() {
  // 显示banner
  console.log(chalk.cyan(banner));

  // 获取账号配置
  console.log(chalk.yellow('请添加要运行的账号，输入空行结束。'));
  const accounts = await getAccountConfigs();

  if (accounts.length === 0) {
    console.log(chalk.red('没有添加任何账号！'));
    return;
  }

  console.log(chalk.green(`\n共添加 ${accounts.length} 个账号，开始运行...\n`));

  // 处理每个账号
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    try {
      await processAccount(account, i, accounts.length, account.proxy);
    } catch (error) {
      console.error(chalk.red(`处理账号 ${i + 1} 时出错: ${error.message}`));
    }
  }

  console.log(chalk.magentaBright('所有账号处理完成。等待24小时后重新运行...'));
  await delay(86400);
  run();
}

run();