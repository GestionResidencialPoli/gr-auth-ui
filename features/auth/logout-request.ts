export const LOGOUT_PARAM = "logout";

export function isLogoutRequest(search: string): boolean {
  return new URLSearchParams(search).get(LOGOUT_PARAM) === "1";
}
