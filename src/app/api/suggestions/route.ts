export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Disabled suggestions API route per user request
  return Response.json({ suggestions: [] });
}
