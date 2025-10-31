import fs from 'fs';
import path from 'path';

const routesFile = path.join(process.cwd(), 'dist', '_routes.json');

try {
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
