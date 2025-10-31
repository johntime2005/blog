import fs from 'fs';
import path from 'path';

const routesFile = path.join(process.cwd(), 'dist', '_routes.json');
const functionsSource = path.join(process.cwd(), 'functions');
const functionsDest = path.join(process.cwd(), 'dist', 'functions');

try {
  // 复制 functions 到 dist 目录（Cloudflare Pages 需要）
  if (fs.existsSync(functionsSource)) {
    console.log('📁 Copying functions to dist/functions/...');

    // 删除旧的 functions 目录（如果存在）
    if (fs.existsSync(functionsDest)) {
      fs.rmSync(functionsDest, { recursive: true, force: true });
    }

    // 递归复制目录
    function copyDir(src, dest) {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    copyDir(functionsSource, functionsDest);
    console.log('✅ Functions copied to dist/functions/');
  }

  const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));

  // 确保 /admin 和 /admin/* 都在exclude列表中，让Cloudflare直接提供静态文件
  if (!routes.exclude.includes('/admin')) {
    routes.exclude.push('/admin');
  }

  if (!routes.exclude.includes('/admin/*')) {
    routes.exclude.push('/admin/*');
  }

  // 确保/_server-islands/*在include列表中（Astro需要）
  if (!routes.include) {
    routes.include = [];
  }

  if (!routes.include.includes('/_server-islands/*')) {
    routes.include.unshift('/_server-islands/*');
  }

  // 确保 /auth/* 在 include 列表中（Decap CMS OAuth 需要）
  if (!routes.include.includes('/auth/*')) {
    routes.include.push('/auth/*');
  }

  fs.writeFileSync(routesFile, JSON.stringify(routes, null, 2) + '\n');
  console.log('✅ Fixed _routes.json to handle /admin correctly');
  console.log('Routes config:', JSON.stringify(routes, null, 2));
} catch (error) {
  console.error('❌ Error fixing routes:', error.message);
  process.exit(1);
}
