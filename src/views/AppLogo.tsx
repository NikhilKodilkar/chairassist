export function AppLogo({ compact = false }: { compact?: boolean }) {
  const src = `${import.meta.env.BASE_URL}Molar-mind-logo.png`;
  return (
    <img
      className={compact ? "app-logo compact" : "app-logo"}
      src={src}
      alt="MolarMind"
    />
  );
}
