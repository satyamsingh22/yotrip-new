import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

const get = vi.fn();
const put = vi.fn();
const post = vi.fn();

interface ApiErrorLike {
  response?: { data?: { message?: string } };
  message?: string;
}

vi.mock("../adminApi", () => ({
  rootApi: {
    get: (...a: unknown[]) => get(...a),
    put: (...a: unknown[]) => put(...a),
    post: (...a: unknown[]) => post(...a),
  },
  apiError: (e: ApiErrorLike) => e?.response?.data?.message || e?.message || "Error",
}));

vi.mock("../AdminAuthContext", () => ({
  useAdminAuthContext: () => ({
    admin: { _id: "admin-1", name: "Asha", email: "asha@yotrip.com", role: "admin" },
    status: "authed",
    isSuperAdmin: false,
  }),
}));

vi.mock("../AdminLayout", () => ({
  default: ({ children, title }: { children?: ReactNode; title?: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

import AdminProfile from "./AdminProfile";

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminProfile />
    </MemoryRouter>
  );

beforeEach(() => {
  get.mockReset();
  put.mockReset();
  post.mockReset();
  get.mockResolvedValue({
    data: {
      name: "Asha",
      designation: "Ops Lead",
      email: "asha@yotrip.com",
      phone: "9876543210",
      profileImage: "/uploads/admin/a.jpg",
    },
  });
  put.mockResolvedValue({ data: { message: "Profile updated" } });
});

describe("AdminProfile", () => {
  it("loads the signed-in admin by id from context, not localStorage", async () => {
    renderPage();
    await waitFor(() => expect(get).toHaveBeenCalledWith("/auth/admin/admin-1"));
    expect(await screen.findByLabelText("Name")).toHaveValue("Asha");
    expect(screen.getByLabelText("Designation")).toHaveValue("Ops Lead");
    expect(screen.getByLabelText("Phone")).toHaveValue("9876543210");
  });

  it("email is read-only", async () => {
    renderPage();
    expect(await screen.findByLabelText("Email")).toBeDisabled();
  });

  it("saves editable fields and confirms success", async () => {
    const user = userEvent.setup();
    renderPage();
    const name = await screen.findByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Asha R");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(put).toHaveBeenCalledWith("/auth/admin/update/admin-1", {
        name: "Asha R",
        designation: "Ops Lead",
        phone: "9876543210",
      })
    );
    expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();
  });

  it("does not call the upload endpoint when no new image was picked", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByLabelText("Name");
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(post).not.toHaveBeenCalled();
  });

  it("surfaces a save failure instead of silently succeeding", async () => {
    const user = userEvent.setup();
    put.mockRejectedValue({ response: { data: { message: "Forbidden" } } });
    renderPage();
    await screen.findByLabelText("Name");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    expect(screen.queryByText(/profile updated/i)).not.toBeInTheDocument();
  });

  it("uploads the new image only after the field update succeeds", async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    put.mockImplementation(async () => {
      order.push("put");
      return { data: {} };
    });
    post.mockImplementation(async () => {
      order.push("post");
      return { data: { profileImage: "/uploads/admin/b.jpg" } };
    });

    const { container } = renderPage();
    await screen.findByLabelText("Name");

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(post).toHaveBeenCalled());
    expect(order).toEqual(["put", "post"]);
  });

  it("does not persist the new image when the field update fails", async () => {
    const user = userEvent.setup();
    put.mockRejectedValue({ response: { data: { message: "Forbidden" } } });

    const { container } = renderPage();
    await screen.findByLabelText("Name");

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(fileInput, file);
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("clears the success alert once the user edits a field again", async () => {
    const user = userEvent.setup();
    renderPage();
    const name = await screen.findByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Asha R");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();

    await user.type(name, "!");
    expect(screen.queryByText(/profile updated/i)).not.toBeInTheDocument();
  });
});
