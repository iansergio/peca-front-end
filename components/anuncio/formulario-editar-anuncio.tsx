"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removerAnuncio, salvarAnuncio } from "@/app/pecas/[id]/editar/actions"
import { CamposAnuncio, conferirTamanhoFoto } from "@/components/anuncio/campos-anuncio"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import type { Peca } from "@/lib/types"
import { cn } from "@/lib/utils"

const MEUS_ANUNCIOS = "/perfil?aba=anuncios"

/**
 * Formulário de edição do anúncio. "Salvar alterações" é o único CTA primário
 * da tela; no celular ele fica numa barra fixa no rodapé (como o contato em
 * docs/Celular anúncio.png), para não exigir rolar até o fim do formulário.
 */
export function FormularioEditarAnuncio({ peca, whatsappInicial }: { peca: Peca; whatsappInicial: string }) {
  const router = useRouter()
  const [salvando, startSalvar] = useTransition()
  const [excluindo, startExcluir] = useTransition()
  const [confirmando, setConfirmando] = useState(false)
  const ocupado = salvando || excluindo
  const destinoLogin = `/login?destino=${encodeURIComponent(`/pecas/${peca.id}/editar`)}`

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    // Chamada manual para o React não limpar os campos quando salvar falhar.
    evento.preventDefault()
    const formData = new FormData(evento.currentTarget)

    const fotoGrande = conferirTamanhoFoto(formData)
    if (fotoGrande) {
      toast.error("A foto deve ter no máximo 5 MB.", { description: fotoGrande })
      return
    }

    startSalvar(async () => {
      const resultado = await salvarAnuncio(peca.id, formData)

      if (resultado.ok === false) {
        toast.error("Não foi possível salvar o anúncio", {
          description: resultado.erro,
          action: resultado.precisaLogin
            ? { label: "Entrar", onClick: () => router.push(destinoLogin) }
            : undefined,
        })
        return
      }

      if (resultado.ok === "parcial") {
        toast.warning("Dados salvos, mas a foto não foi trocada", { description: resultado.erro })
      } else {
        toast.success("Anúncio atualizado!", { description: "As alterações já aparecem na vitrine." })
      }
      router.push(`/pecas/${peca.id}`)
    })
  }

  function handleExcluir() {
    // Fecha a confirmação na hora: o progresso aparece no próprio botão "Excluir anúncio".
    setConfirmando(false)
    startExcluir(async () => {
      const resultado = await removerAnuncio(peca.id)
      if (!resultado.ok) {
        toast.error("Não foi possível excluir o anúncio", {
          description: resultado.erro,
          action: resultado.precisaLogin
            ? { label: "Entrar", onClick: () => router.push(destinoLogin) }
            : undefined,
        })
        return
      }
      toast.success("Anúncio excluído", { description: "A peça saiu da vitrine." })
      router.push(MEUS_ANUNCIOS)
    })
  }

  return (
    <div className="flex flex-col gap-4 pb-20 sm:pb-0">
      <form onSubmit={handleSubmit} className="rounded-xl bg-card p-4 shadow-cartao md:p-6">
        <fieldset disabled={ocupado} className="flex flex-col gap-6">
          <CamposAnuncio peca={peca} whatsappInicial={whatsappInicial} />
        </fieldset>

        {/* Celular: barra fixa no rodapé. Desktop: ações no fim do cartão. */}
        <div className="fixed inset-x-0 bottom-0 z-20 flex gap-3 border-t bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mt-8 sm:justify-end sm:border-t-0 sm:p-0">
          <Link
            href={MEUS_ANUNCIOS}
            aria-disabled={ocupado}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 sm:flex-none sm:px-6",
              ocupado && "pointer-events-none opacity-50"
            )}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={ocupado} className="flex-[2] text-base sm:flex-none sm:px-8">
            {salvando ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </form>

      <section aria-labelledby="titulo-excluir" className="rounded-xl border border-destructive/30 bg-card p-4 md:p-6">
        <h2 id="titulo-excluir" className="text-lg font-bold">
          Excluir anúncio
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A peça sai da vitrine e a foto é apagada. Não dá para desfazer.
        </p>
        <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
          <AlertDialogTrigger
            render={<Button variant="destructive" disabled={ocupado} className="mt-4 w-full sm:w-auto" />}
          >
            {excluindo ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
            {excluindo ? "Excluindo..." : "Excluir anúncio"}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir este anúncio?</AlertDialogTitle>
              <AlertDialogDescription>
                “{peca.titulo}” sai da vitrine e os compradores não vão mais encontrá-lo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Manter anúncio</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={handleExcluir}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}
