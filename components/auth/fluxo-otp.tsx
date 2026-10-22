"use client"

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Loader2, MailCheckIcon } from "lucide-react"
import { toast } from "sonner"

import type { ResultadoAuth } from "@/app/login/actions"
import { FormularioAuth } from "@/components/auth/formulario-auth"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

/** Espera entre reenvios, para a pessoa não disparar vários emails seguidos. */
const ESPERA_REENVIO_S = 30

type Acao = (formData: FormData) => Promise<ResultadoAuth>

/**
 * Fluxo de duas etapas do login sem senha:
 * 1. `children` são os campos da etapa 1 (no mínimo `email`); `acaoEnviar`
 *    pede o código ao backend.
 * 2. A pessoa digita o código de 6 dígitos e `acaoConfirmar` valida e
 *    redireciona.
 *
 * Os campos da etapa 1 seguem como `hidden` na etapa 2, porque o registo
 * precisa de nome e WhatsApp de novo para salvar o perfil depois do login.
 */
export function FluxoOtp({
  acaoEnviar,
  acaoConfirmar,
  rotuloEnviar,
  children,
}: {
  acaoEnviar: Acao
  acaoConfirmar: Acao
  rotuloEnviar: string
  children: ReactNode
}) {
  const [dados, setDados] = useState<[string, string][] | null>(null)

  if (!dados) {
    return (
      <FormularioAuth
        acao={acaoEnviar}
        aoConcluir={(formData) =>
          setDados(
            // `destino` já é repassado pelo próprio FormularioAuth.
            [...formData.entries()].filter(
              (par): par is [string, string] => typeof par[1] === "string" && par[0] !== "destino"
            )
          )
        }
        rotuloEnviar={rotuloEnviar}
        rotuloEnviando="Enviando código..."
      >
        {children}
      </FormularioAuth>
    )
  }

  return (
    <EtapaCodigo
      dados={dados}
      acaoEnviar={acaoEnviar}
      acaoConfirmar={acaoConfirmar}
      aoTrocarEmail={() => setDados(null)}
    />
  )
}

function EtapaCodigo({
  dados,
  acaoEnviar,
  acaoConfirmar,
  aoTrocarEmail,
}: {
  dados: [string, string][]
  acaoEnviar: Acao
  acaoConfirmar: Acao
  aoTrocarEmail: () => void
}) {
  const email = dados.find(([campo]) => campo === "email")?.[1] ?? ""
  const campoCodigo = useRef<HTMLDivElement>(null)
  const [codigo, setCodigo] = useState("")
  const [espera, setEspera] = useState(ESPERA_REENVIO_S)
  const [reenviando, startReenvio] = useTransition()

  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  function handleReenviar() {
    const formData = new FormData()
    formData.set("email", email)
    startReenvio(async () => {
      const resultado = await acaoEnviar(formData)
      if (resultado.ok) {
        toast.success("Enviamos um novo código", { description: email })
        setEspera(ESPERA_REENVIO_S)
      } else {
        toast.error("Não foi possível reenviar o código", { description: resultado.erro })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 rounded-lg bg-secondary p-3 text-sm">
        <MailCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p>
          Enviamos um código de 6 dígitos para <strong className="break-all">{email}</strong>.{" "}
          <button
            type="button"
            onClick={aoTrocarEmail}
            className="rounded-sm font-semibold text-destaque underline-offset-4 outline-none hover:text-marca hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Trocar email
          </button>
        </p>
      </div>

      <FormularioAuth
        acao={acaoConfirmar}
        // Código errado: limpa os dígitos e devolve o foco para digitar de novo.
        aoFalhar={() => {
          setCodigo("")
          requestAnimationFrame(() => campoCodigo.current?.querySelector("input")?.focus())
        }}
        rotuloEnviar="Confirmar"
        rotuloEnviando="Confirmando..."
      >
        {dados.map(([campo, valor]) => (
          <input key={campo} type="hidden" name={campo} value={valor} />
        ))}
        <Field>
          <FieldLabel htmlFor="codigo">Código de acesso</FieldLabel>
          <div ref={campoCodigo}>
            <InputOTP
              id="codigo"
              name="codigo"
              maxLength={6}
              value={codigo}
              onChange={setCodigo}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              containerClassName="justify-center sm:justify-start"
              // Ao completar os 6 dígitos (inclusive colando do email), envia sozinho.
              onComplete={() => campoCodigo.current?.closest("form")?.requestSubmit()}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="size-11 bg-card text-lg font-bold" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <FieldDescription>O código vale por 10 minutos. Confira também a caixa de spam.</FieldDescription>
        </Field>
      </FormularioAuth>

      <p className="text-center text-sm text-muted-foreground">
        Não recebeu?{" "}
        <Button
          type="button"
          variant="link"
          className="h-11 px-1"
          disabled={espera > 0 || reenviando}
          onClick={handleReenviar}
        >
          {reenviando ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Reenviando...
            </>
          ) : espera > 0 ? (
            `Reenviar código em ${espera}s`
          ) : (
            "Reenviar código"
          )}
        </Button>
      </p>
    </div>
  )
}
