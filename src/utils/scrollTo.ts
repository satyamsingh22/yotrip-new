export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};