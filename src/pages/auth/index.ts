// OAuth 授权端点
export const prerender = false;

export async function GET({ request, redirect, locals }) {
  const runtime = locals.runtime as any;
  const clientId = runtime?.env?.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response('GitHub OAuth not configured. Please set GITHUB_CLIENT_ID in Cloudflare Pages environment variables.', { status: 500 });
  }

  const url = new URL(request.url);
  const authUrl = new URL('https://github.com/login/oauth/authorize');

  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
  authUrl.searchParams.set('scope', 'repo,user');

  return redirect(authUrl.toString(), 302);
}
