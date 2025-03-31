export function badRequest(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: { "Content-Type": "application/json" },
  });
}
