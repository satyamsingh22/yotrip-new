import api from "../../../tockenapi/api";

/**
 * Customer self-service account deletion.
 * Identity comes from the existing Bearer token / auth cookie — no userId is sent.
 */
export async function requestAccountDeletion(
  client: Pick<typeof api, "delete"> = api,
) {
  return client.delete("/api/auth/account", { withCredentials: true });
}

/** Extra local keys login stores that AuthContext.logout does not currently clear. */
export function clearDeletedAccountLocalKeys() {
  localStorage.removeItem("userId");
  localStorage.removeItem("name");
}
