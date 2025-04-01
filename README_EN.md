# MonadScore Automation Tool

<div align="right">
  <a href="README.md">中文</a> | English
</div>

## 📝 Usage Guide

### 1. Register Account
First, visit [MonadScore](https://monadscore.xyz/signup/r/D1b91KrI) to register your account

### 2. VPS Environment Setup

#### 2.1 Install NVM
```bash
# Download and install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Configure environment variables
source ~/.bashrc   # if using bash
source ~/.zshrc    # if using zsh
```

#### 2.2 Install Node.js 22
```bash
# Install Node.js 22
nvm install 22

# List installed versions
nvm list

# Use Node.js 22
nvm use 22
nvm alias default 22
```

#### 2.3 Verify Installation
```bash
# Check Node.js version
node -v   # Expected output: v22.13.1
nvm current # Expected output: v22.13.1
npm -v    # Expected output: 10.9.2
```

### 3. Install Program
```bash
# Clone repository
git clone https://github.com/mumumusf/monadscore.git
cd monadscore

# Install dependencies
npm install
```

### 4. Run Program
```bash
# Create new screen session
screen -S monadscore

# Run program
node index.js

# Detach screen session
# Press Ctrl + A then D

# Reconnect to screen session
screen -r monadscore
```

### 5. Usage Instructions
1. After running the program, enter your wallet private key as prompted
2. Enter proxy address (supports formats: IP:PORT or IP:PORT:USERNAME:PASSWORD)
3. You can add multiple accounts, press Enter to finish adding
4. Program will automatically execute tasks and start nodes
5. Auto-restart every 24 hours

## 📞 Contact

For any questions or suggestions, please contact the author through:

- Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

## ⚖️ Disclaimer

1. This program is for learning and communication purposes only
2. Commercial use is prohibited
3. Users are responsible for any consequences arising from using this program

---
Made with ❤️ by [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 