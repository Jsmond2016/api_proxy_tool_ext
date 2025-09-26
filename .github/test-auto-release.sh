#!/bin/bash

# 自动发布工作流测试脚本
# 用于验证 commit 消息格式检测逻辑

echo "🧪 测试自动发布工作流的 commit 消息检测逻辑"
echo "================================================"

# 测试用例
test_cases=(
    "chore(release): 1.0.1"
    "chore(release): 2.1.0"
    "chore(release): 1.0.0-beta.1"
    "chore(release): v1.0.1"
    "chore(release): 1.0.1 fix bug"
    "chore: release 1.0.1"
    "feat: add new feature"
    "fix: bug fix"
)

# 模拟检测函数
check_commit_format() {
    local commit_msg="$1"
    echo "测试 commit 消息: '$commit_msg'"
    
    if [[ $commit_msg =~ ^chore\(release\):\ ([0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?)$ ]]; then
        local version=${BASH_REMATCH[1]}
        echo "✅ 有效格式 - 版本: $version"
        return 0
    else
        echo "❌ 无效格式"
        return 1
    fi
}

echo ""
echo "📋 测试结果:"
echo "============"

valid_count=0
total_count=${#test_cases[@]}

for test_case in "${test_cases[@]}"; do
    echo ""
    if check_commit_format "$test_case"; then
        ((valid_count++))
    fi
done

echo ""
echo "📊 测试总结:"
echo "============"
echo "总测试用例: $total_count"
echo "有效格式: $valid_count"
echo "无效格式: $((total_count - valid_count))"

echo ""
echo "✅ 预期结果:"
echo "- 前3个应该有效 (标准格式和预发布格式)"
echo "- 后5个应该无效 (错误格式)"

echo ""
echo "🎯 使用方法:"
echo "============"
echo "1. 使用 npm scripts:"
echo "   pnpm run version:patch"
echo "   pnpm run version:minor" 
echo "   pnpm run version:major"
echo ""
echo "2. 手动创建 commit:"
echo "   git commit -m \"chore(release): 1.0.1\""
echo ""
echo "3. 推送到 main 分支:"
echo "   git push origin main"
