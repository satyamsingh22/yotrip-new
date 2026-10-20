import { createContext, ReactNode, useContext, useState } from "react";

export type AuthModalName = "Login" | "Register" | "Forgot";

type ModalContextType = {
  /**
   * The single source of truth for which auth modal is showing. Kept here
   * rather than in <Header /> so that state and the open/close requests coming
   * from elsewhere in the tree cannot drift apart — when they were separate,
   * switching from Register to Login left `registerOpen` stuck true and the
   * home-page CTA silently stopped working.
   */
  activeModal: AuthModalName | null;
  openModal: (modal: AuthModalName) => void;
  closeModal: () => void;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  registerOpen: boolean;
  openRegister: () => void;
  closeRegister: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<AuthModalName | null>(null);

  const openModal = (modal: AuthModalName) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  // Close only if that modal is the one showing, so a stale close from one
  // caller can't dismiss a modal another caller just opened.
  const closeIfActive = (modal: AuthModalName) =>
    setActiveModal((current) => (current === modal ? null : current));

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        openModal,
        closeModal,
        loginOpen: activeModal === "Login",
        openLogin: () => openModal("Login"),
        closeLogin: () => closeIfActive("Login"),
        registerOpen: activeModal === "Register",
        openRegister: () => openModal("Register"),
        closeRegister: () => closeIfActive("Register"),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside ModalProvider");
  }

  return context;
};
