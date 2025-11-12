# 🔐 密钥泄露处理清单

## ✅ 完成状态

### 第一阶段:紧急响应
- [x] 已撤销/重新生成泄露的密钥 `AIzaSy***`
- [ ] 检查密钥提供商的使用日志,确认无异常调用
- [ ] 如果是付费API,检查账单是否异常

### 第二阶段:防护加固 ✅
- [x] 更新 `.gitignore` 排除敏感文件类型
- [x] 创建 `.env.example` 模板文件
- [x] 配置 `.gitleaks.toml` 密钥扫描规则
- [x] 创建 `pre-commit` hook 自动检测密钥
- [x] 编写 `SECURITY_GUIDE.md` 安全指南

### 第三阶段:清理Git历史 ⚠️
- [ ] 从工作区删除敏感文件 `word_zipfdk_2025110611374200krq.sql`
- [ ] 运行 `./clean-git-history.sh` 清理Git历史
- [ ] 验证清理结果
- [ ] 强制推送到远程仓库 (需团队协调)
- [ ] 通知所有协作者重新克隆仓库

### 第四阶段:工具安装 (推荐)
- [ ] 安装 `gitleaks` 密钥扫描工具
  ```bash
  # macOS
  brew install gitleaks

  # Linux
  wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz
  tar -xzf gitleaks_linux_x64.tar.gz
  sudo mv gitleaks /usr/local/bin/
  ```

- [ ] 安装 `git-filter-repo` (用于清理历史)
  ```bash
  pip install git-filter-repo
  ```

### 第五阶段:验证测试
- [ ] 测试 pre-commit hook
  ```bash
  # 尝试提交一个包含假密钥的文件
  echo "API_KEY=AIzaSyTest123456789012345678901234567" > test.txt
  git add test.txt
  git commit -m "test"  # 应该被阻止
  rm test.txt
  ```

- [ ] 运行完整扫描
  ```bash
  gitleaks detect --source . --verbose
  ```

### 第六阶段:持续监控
- [ ] 启用 GitHub Secret Scanning
  - 仓库 Settings → Security → Code security and analysis
  - 启用 "Secret scanning"

- [ ] 设置定期审计任务
  - 每月运行: `gitleaks detect --source . --report-path report.json`

## 📋 执行步骤详解

### 立即执行:删除敏感文件
```bash
# 1. 从工作区删除
rm word_zipfdk_2025110611374200krq.sql

# 2. 从Git跟踪中移除 (但不删除历史)
git rm --cached word_zipfdk_2025110611374200krq.sql

# 3. 提交变更
git commit -m "chore: 移除敏感数据库文件"
```

### 清理Git历史 (⚠️危险操作)
```bash
# 运行清理脚本
./clean-git-history.sh

# 或者手动执行
git filter-repo --path word_zipfdk_2025110611374200krq.sql --invert-paths --force

# 强制推送 (需团队协调!)
git push origin --force --all
git push origin --force --tags
```

### 团队协作通知模板
```
主题: [重要] Git 仓库需要重新克隆

各位,

我们最近修复了一个密钥泄露问题,并重写了 Git 历史以移除敏感文件。

请执行以下操作:

1. 提交并备份当前的所有本地更改
2. 删除本地仓库
3. 重新克隆:
   git clone <repository-url>

如有问题,请联系我。

感谢配合!
```

## 🔍 验证命令

```bash
# 检查文件是否还在历史中
git log --all --full-history -- word_zipfdk_2025110611374200krq.sql

# 应该返回空结果,表示清理成功

# 检查 .gitignore 是否生效
git check-ignore word_zipfdk_2025110611374200krq.sql
# 应该输出文件名,表示已被忽略

# 测试 pre-commit hook
cat .git/hooks/pre-commit
# 应该看到密钥扫描脚本
```

## 📚 相关文档

- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) - 完整安全指南
- [.gitleaks.toml](./.gitleaks.toml) - 密钥扫描配置
- [clean-git-history.sh](./clean-git-history.sh) - 历史清理脚本

---

**最后更新**: 2025-11-12
**状态**: 防护已加固 ✅ | 历史待清理 ⚠️
