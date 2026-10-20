import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const { logout, requestAccountDeletion, clearDeletedAccountLocalKeys, toastSuccess } =
  vi.hoisted(() => ({
    logout: vi.fn().mockResolvedValue(undefined),
    requestAccountDeletion: vi.fn().mockResolvedValue({}),
    clearDeletedAccountLocalKeys: vi.fn(),
    toastSuccess: vi.fn(),
  }));

vi.mock("../../../../context/AuthContext", () => ({
  useAuth: () => ({ logout }),
}));

vi.mock("../deleteAccount", () => ({
  requestAccountDeletion,
  clearDeletedAccountLocalKeys,
}));

vi.mock("react-hot-toast", () => ({
  default: { success: toastSuccess },
}));

vi.mock("react-phone-number-input", () => ({
  default: () => null,
}));

import SecuritySettingsModal from "./securitySettingsModal";

const renderModal = () =>
  render(
    <MemoryRouter>
      <SecuritySettingsModal />
    </MemoryRouter>,
  );

describe("SecuritySettingsModal delete account", () => {
  beforeEach(() => {
    logout.mockClear();
    requestAccountDeletion.mockReset().mockResolvedValue({});
    clearDeletedAccountLocalKeys.mockClear();
    toastSuccess.mockClear();
  });

  it("keeps the existing confirmation modals", () => {
    renderModal();
    expect(document.getElementById("delete-account")).toBeTruthy();
    expect(document.getElementById("del-acc")).toBeTruthy();
    expect(
      screen.getByText("Are you sure you want to delete your account?"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Account deletion is permanent/)).toBeInTheDocument();
  });

  it("calls the account deletion API then logs the user out", async () => {
    const user = userEvent.setup();
    renderModal();
    const confirm = document.querySelector("#del-acc .btn-primary") as HTMLButtonElement;
    await user.click(confirm);

    expect(requestAccountDeletion).toHaveBeenCalledTimes(1);
    expect(clearDeletedAccountLocalKeys).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("Your account has been deleted.");
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("shows an error and does not log out when the API fails", async () => {
    requestAccountDeletion.mockRejectedValue({
      response: { data: { error: "Delete failed" } },
    });
    const user = userEvent.setup();
    renderModal();
    const confirm = document.querySelector("#del-acc .btn-primary") as HTMLButtonElement;
    await user.click(confirm);

    expect(await screen.findByText("Delete failed")).toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });
});
