import SiteShell from "@/components/SiteShell";
import Cta from "@/components/sections/Cta";
import Everyday from "@/components/sections/Everyday";
import Experience from "@/components/sections/Experience";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Reveal from "@/components/sections/Reveal";
import Specs from "@/components/sections/Specs";
import Technology from "@/components/sections/Technology";

export default function Page() {
  return (
    <SiteShell>
      <main id="main">
        <Hero />
        <Reveal />
        <Experience />
        <Technology />
        <Everyday />
        <Specs />
        <Cta />
      </main>
      <Footer />
    </SiteShell>
  );
}
