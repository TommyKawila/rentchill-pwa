export function getOwnerIdFromRequest(request: Request) {
  return request.headers.get("x-owner-id");
}
