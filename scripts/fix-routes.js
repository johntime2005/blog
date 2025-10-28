import fs from 'fs';
import path from 'path';

const routesFile = path.join(process.cwd(), 'dist', '_routes.json');

try {
  const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));

  // 从exclude列表中移除/admin/*以及/admin
  routes.exclude = routes.exclude.filter(route =>
    route !== '/admin/*' && route !== '/admin/'
  );

  // 添加特定的include规则来处理admin路由
  if (!routes.include) {
    routes.include = [];
  }

  // 确保/_server-islands/*在列表中（Astro需要）
  if (!routes.include.includes('/_server-islands/*')) {
    routes.include.unshift('/_server-islands/*');
  }

  // 添加/admin*处理
  if (!routes.include.includes('/admin*')) {
    routes.include.push('/admin*');
  }

  fs.writeFileSync(routesFile, JSON.stringify(routes, null, 2) + '\n');
  console.log('✅ Fixed _routes.json to handle /admin correctly');
  console.log('Routes config:', JSON.stringify(routes, null, 2));
} catch (error) {
  console.error('❌ Error fixing routes:', error.message);
  process.exit(1);
}
