import Link from "next/link"
import { Suspense, type ReactNode } from "react"

import { LinkComDestino } from "@/components/auth/campo-destino"

/** Layout comum de /login e /registo: cartão estreito centrado, com link para a outra tela. */
export function PaginaAuth({
  titulo,
  subtitulo,
  pergunta,
  linkAlternativo,
  children,
}: {
  titulo: string
  subtitulo: string
  pergunta: string
  linkAlternativo: { href: string; rotulo: string }
  children: ReactNode
}) {
  const classeLink = "font-semibold text-primary underline-offset-4 hover:underline"

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{titulo}</h1>
      <p className="mt-1 mb-6 text-muted-foreground">{subtitulo}</p>
      <div className="rounded-2xl border bg-card p-4 md:p-6">{children}</div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {pergunta}{" "}
        <Suspense
          fallback={
            <Link href={linkAlternativo.href} className={classeLink}>
              {linkAlternativo.rotulo}
            </Link>
          }
        >
          <LinkComDestino href={linkAlternativo.href} className={classeLink}>
            {linkAlternativo.rotulo}
          </LinkComDestino>
        </Suspense>
      </p>
    </div>
  )
}
