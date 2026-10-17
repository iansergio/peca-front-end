import { Button } from "@/components/ui/button";

// Página provisória: a vitrine completa será implementada na Fase 3.
export default function Home() {
  return (
    <section className="rounded-2xl border bg-linear-to-br from-secondary to-card p-6 md:p-10">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
        Encontre a peça certa.
        <br />
        Venda o que está parado.
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Um marketplace simples e direto para quem compra, vende ou procura peças
        e celulares.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="h-10 px-4">Explorar peças</Button>
        <Button variant="outline" className="h-10 px-4 text-primary">
          Estou procurando
        </Button>
      </div>
    </section>
  );
}
