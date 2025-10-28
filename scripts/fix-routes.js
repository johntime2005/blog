import fs from 'fs';
import path from 'path';

const routesFile = path.join(process.cwd(), 'dist', '_routes.json');

try {
  const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));

  // 从include列表中移除/admin*，让静态文件直接提供
  if (routes.include) {
    routes.include = routes.include.filter(route => route !== '/admin*');
  }

  // 从exclude列表中移除/admin/*以及/admin（如果存在）
  routes.exclude = routes.exclude.filter(route =>
    route !== '/admin/*' && route !== '/admin/' && route !== '/admin'
  );

  // 确保/_server-islands/*在列表中（Astro需要）
  if (!routes.include) {
    routes.include = [];
  }

  if (!routes.include.includes('/_server-islands/*')) {
    routes.include.unshift('/_server-islands/*');
  }

  fs.writeFileSync(routesFile, JSON.stringify(routes, null, 2) + '\n');
  console.log('✅ Fixed _routes.json to handle /admin correctly');
  console.log('Routes config:', JSON.stringify(routes, null, 2));
} catch (error) {
  console.error('❌ Error fixing routes:', error.message);
  process.exit(1);
}
