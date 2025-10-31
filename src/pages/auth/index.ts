// OAuth 授权端点
export const prerender = false;

export async function GET({ request, redirect }) {
  const clientId = import.meta.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response('GitHub OAuth not configured', { status: 500 });
  }

  const url = new URL(request.url);
  const authUrl = new URL('https://github.com/login/oauth/authorize');

  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
  authUrl.searchParams.set('scope', 'repo,user');

  return redirect(authUrl.toString(), 302);
}
