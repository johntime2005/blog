// 简单的环境变量测试
export const prerender = false;

export async function GET({ locals }) {
	const runtime = locals.runtime as any;

	// 简单测试：只检查是否存在
	const hasClientId = !!runtime?.env?.GITHUB_CLIENT_ID;
	const hasSecret = !!runtime?.env?.GITHUB_CLIENT_SECRET;

	if (hasClientId && hasSecret) {
		return new Response("✅ Environment variables are configured correctly!", {
			status: 200,
			headers: { "Content-Type": "text/plain" },
		});
	}
	let message = "❌ Missing environment variables:\n";
	if (!hasClientId) message += "- GITHUB_CLIENT_ID\n";
	if (!hasSecret) message += "- GITHUB_CLIENT_SECRET\n";
	message +=
		"\nPlease check Cloudflare Pages Settings → Environment variables → Production";

	return new Response(message, {
		status: 500,
		headers: { "Content-Type": "text/plain" },
	});
}
