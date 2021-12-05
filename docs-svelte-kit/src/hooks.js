export async function handle({ request, resolve }) {
  const response = await resolve(request)
  return response
}
