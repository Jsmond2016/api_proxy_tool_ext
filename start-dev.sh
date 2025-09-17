#!/bin/bash

echo "🚀 启动 API Proxy Tool 开发环境"
echo "=================================="

# 检查是否安装了pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 未找到pnpm，请先安装pnpm"
    echo "安装命令: npm install -g pnpm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
pnpm run build

echo ""
echo "✅ 构建完成！"
echo ""
echo "📋 安装步骤："
echo "1. 打开Chrome浏览器"
echo "2. 进入 chrome://extensions/"
echo "3. 开启'开发者模式'"
echo "4. 点击'加载已解压的扩展程序'"
echo "5. 选择项目的 dist_chrome 目录"
echo ""
echo "🎉 安装完成后，点击扩展图标即可使用！"
echo ""
echo "💡 提示："
echo "- 可以使用 example-config.json 作为示例配置"
echo "- 开发时使用 pnpm run dev 启动热重载"
echo "- 查看 README_PROXY_TOOL.md 了解详细使用方法"
