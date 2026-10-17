import { Button } from "@/components/ui/button"

export function CtaProcurando() {
  return (
    <section
      id="procurando"
      className="scroll-mt-28 rounded-2xl bg-foreground p-6 text-background md:p-10"
    >
      <h2 className="text-xl font-bold md:text-2xl">Não encontrou a peça?</h2>
      <p className="mt-2 text-sm text-background/80">
        Publique o que você está procurando para vendedores encontrarem você.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-5 h-10 border-transparent px-4 text-foreground"
      >
        Estou procurando
      </Button>
    </section>
  )
}
