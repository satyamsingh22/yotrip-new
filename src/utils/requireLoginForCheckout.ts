import toast from "react-hot-toast";

export function rememberCheckoutReturnUrl() {
  sessionStorage.setItem(
    "returnUrl",
    `${window.location.pathname}${window.location.search}`,
  );
}

/** Opens login and remembers where to return after sign-in. */
export function promptLoginForCheckout(
  openLogin: () => void,
  message = "Please log in to complete checkout.",
) {
  rememberCheckoutReturnUrl();
  toast.error(message);
  openLogin();
}

export function isLoggedInForCheckout(status: string) {
  return status === "authenticated";
}
