// OAuth authorization endpoint
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response('GitHub OAuth not configured', { status: 500 });
  }

  // Redirect to GitHub OAuth authorization
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
  authUrl.searchParams.set('scope', 'repo,user');

  return Response.redirect(authUrl.toString(), 302);
}
