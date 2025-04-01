# MonadScore 自动化工具

<div align="right">
  <a href="README.md">中文</a> | <a href="README_EN.md">English</a>
</div>

##  使用说明

### 1. 注册账号
首先访问 [MonadScore](https://monadscore.xyz/signup/r/D1b91KrI) 注册账号

### 2. VPS环境配置

#### 2.1 安装 NVM
```bash
# 下载并安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 配置环境变量
source ~/.bashrc   # 如果使用 bash
source ~/.zshrc    # 如果使用 zsh
```

#### 2.2 安装 Node.js 22
```bash
# 安装 Node.js 22
nvm install 22

# 查看已安装的版本
nvm list

# 使用 Node.js 22
nvm use 22
nvm alias default 22
```

#### 2.3 验证安装
```bash
# 检查 Node.js 版本
node -v   # 预期输出: v22.13.1
nvm current # 预期输出: v22.13.1
npm -v    # 预期输出: 10.9.2
```

### 3. 安装程序
```bash
# 克隆仓库
git clone https://github.com/mumumusf/monadscore.git
cd monadscore

# 安装依赖
npm install
```

### 4. 运行程序
```bash
# 创建新的 screen 会话
screen -S monadscore

# 运行程序
node index.js

# 分离 screen 会话
# 按 Ctrl + A 然后按 D

# 重新连接到 screen 会话
screen -r monadscore
```

### 5. 使用说明
1. 运行程序后，按提示输入钱包私钥
2. 输入代理地址（支持格式：IP:PORT 或 IP:PORT:USERNAME:PASSWORD）
3. 可以添加多个账号，输入空行结束添加
4. 程序会自动执行任务和启动节点
5. 每24小时自动重新运行

## 📞 联系方式

如有任何问题或建议，欢迎通过以下方式联系作者:

- Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

## ⚖️ 免责声明

1. 本程序仅供学习交流使用
2. 禁止用于商业用途
3. 使用本程序产生的任何后果由用户自行承担

---
Made with ❤️ by [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 
