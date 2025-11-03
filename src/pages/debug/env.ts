// 调试环境变量端点
export const prerender = false;

export async function GET({ locals }) {
  const runtime = locals.runtime as any;

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      GITHUB_CLIENT_ID: runtime?.env?.GITHUB_CLIENT_ID ? '已设置 (前4位: ' + runtime.env.GITHUB_CLIENT_ID.substring(0, 4) + '...)' : '未设置',
      GITHUB_CLIENT_SECRET: runtime?.env?.GITHUB_CLIENT_SECRET ? '已设置 (长度: ' + runtime.env.GITHUB_CLIENT_SECRET.length + ')' : '未设置',
    },
    runtime: {
      exists: !!runtime,
      envExists: !!runtime?.env,
      envKeys: runtime?.env ? Object.keys(runtime.env).filter(key => key.includes('GITHUB')) : [],
    }
  };

  return new Response(JSON.stringify(debugInfo, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}