import { CategoryGrid } from "@/components/vitrine/category-grid";
import { CtaProcurando } from "@/components/vitrine/cta-procurando";
import { HeroSection } from "@/components/vitrine/hero-section";
import { PecaCard } from "@/components/vitrine/peca-card";
import { pecasDestaque } from "@/lib/mocks/pecas";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <HeroSection />
      <CategoryGrid />

      <section id="destaques" aria-labelledby="destaques-titulo" className="scroll-mt-28">
        <h2 id="destaques-titulo" className="mb-3 text-xl font-bold">
          Destaques
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {pecasDestaque.map((peca) => (
            <li key={peca.id} className="flex">
              <PecaCard peca={peca} />
            </li>
          ))}
        </ul>
      </section>

      <CtaProcurando />
    </div>
  );
}
