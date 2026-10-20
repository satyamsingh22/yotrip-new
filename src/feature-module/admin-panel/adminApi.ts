import axios from "axios";

/**
 * Axios instance for the admin panel.
 * - baseURL points at the backend's /api/admin namespace
 * - withCredentials sends the `admintoken` cookie set on admin login
 */
const adminApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin`,
  withCredentials: true,
});

/**
 * Axios instance for existing/reusable endpoints that live outside the
 * /api/admin namespace (auth, gallery, career). Same admin cookie applies.
 */
export const rootApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  withCredentials: true,
});

// Surface a readable message regardless of backend error shape.
export const apiError = (err: any): string =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  "Something went wrong";

export default adminApi;
