// Loading half of the chat assistant's checkout links; the UI is CheckoutLinkCard.
import api from "@/tockenapi/api";

export type CheckoutLinkPhase =
  | { kind: "loading"; message: string }
  | { kind: "expired"; searchUrl: string }
  | { kind: "missing"; searchUrl: string }
  | { kind: "unavailable"; message: string; searchUrl: string }
  | { kind: "error" };

type ApiError = {
  response?: { status?: number; data?: { message?: string; error?: string; search?: Record<string, unknown> } };
};

/** Server message from a failed request, or the fallback. */
export const apiErrorMessage = (e: unknown, fallback: string) => {
  const data = (e as ApiError)?.response?.data;
  return data?.message || data?.error || fallback;
};

/**
 * GET /api/checkout-links/:id. Resolves the link, or the phase to show instead
 * (expired → back to a search for the same trip, unknown, or a network error).
 */
export const loadCheckoutLink = async <Search, Offer>(
  checkoutId: string,
  searchUrlFor: (search: Partial<Search>) => string,
): Promise<
  | { ok: true; link: { offer: Offer; search: Search; currency?: string } }
  | { ok: false; phase: CheckoutLinkPhase }
> => {
  try {
    const { data } = await api.get(`/api/checkout-links/${encodeURIComponent(checkoutId)}`);
    return { ok: true, link: data };
  } catch (e) {
    const status = (e as ApiError)?.response?.status;
    if (status === 410) {
      const search = ((e as ApiError).response?.data?.search || {}) as Partial<Search>;
      return { ok: false, phase: { kind: "expired", searchUrl: searchUrlFor(search) } };
    }
    if (status === 404) return { ok: false, phase: { kind: "missing", searchUrl: searchUrlFor({}) } };
    return { ok: false, phase: { kind: "error" } };
  }
};
