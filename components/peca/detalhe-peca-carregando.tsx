import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo formato da página de detalhes: foto 4:3 e os três cartões. */
export function DetalhePecaCarregando() {
  return (
    <div
      role="status"
      aria-label="Carregando a peça"
      className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none lg:rounded-xl" />
      <div className="flex flex-col gap-3 px-4 pt-3 lg:gap-4 lg:px-0 lg:pt-0">
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-cartao lg:p-6">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-cartao lg:p-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-cartao lg:p-6">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
