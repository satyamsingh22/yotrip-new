import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: {
        name: { firstName: "Satyam", lastName: "Singh", fullName: "Satyam Singh" },
        email: "satyam@example.com",
        phone: "+91 90000 00000",
        address: { city: "Ballia" },
      },
    }),
  },
}));

vi.mock("@/tockenapi/api", () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

import MyProfile from "./myProfile";

beforeEach(() => {
  localStorage.setItem("token", "t");
  localStorage.setItem("name", "Satyam Singh");
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/user/my-profile"]}>
      <MyProfile />
    </MemoryRouter>,
  );

describe("My Profile", () => {
  it("shows personal details and N/A for missing address parts", async () => {
    renderPage();

    const personal = await screen.findByRole("region", { name: "Personal Information" });
    expect(within(personal).getByLabelText("Email")).toHaveTextContent("satyam@example.com");
    expect(within(personal).getByLabelText("Phone")).toHaveTextContent("+91 90000 00000");

    const address = screen.getByRole("region", { name: "Address Information" });
    expect(within(address).getByLabelText("City")).toHaveTextContent("Ballia");
    expect(within(address).getByLabelText("Country")).toHaveTextContent("N/A");
  });

  it("marks My Profile current in the sidebar and offers to add a traveler", async () => {
    renderPage();

    expect(await screen.findByText("No saved travelers yet")).toBeInTheDocument();
    const nav = screen.getByRole("complementary", { name: "Account" });
    expect(within(nav).getByRole("link", { name: "My Profile" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("heading", { name: "Satyam Singh" })).toBeInTheDocument();
  });
});
