import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function PecaNaoEncontrada() {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-10 text-center"
    >
      <PackageSearch className="size-8 text-muted-foreground" aria-hidden />
      <h1 className="font-heading text-xl font-bold">Peça não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        Este anúncio não existe ou foi removido pelo anunciante.
      </p>
      <Link
        href="/pecas"
        className="mt-1 inline-flex h-11 items-center rounded-sm font-bold text-destaque underline underline-offset-4 outline-none hover:text-marca focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Ver todas as peças
      </Link>
    </div>
  );
}
