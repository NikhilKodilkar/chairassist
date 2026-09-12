import { AppLogo } from "./AppLogo";
import { landingHero, landingSubtext } from "./landingCopy";

export function LandingView() {
  return (
    <main className="screen landing">
      <header className="landing-brand">
        <AppLogo />
      </header>
      <section className="landing-hero">
        <h1>{landingHero}</h1>
        <p>{landingSubtext}</p>
      </section>
    </main>
  );
}
