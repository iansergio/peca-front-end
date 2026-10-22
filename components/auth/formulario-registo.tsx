"use client"

import { confirmarRegisto, iniciarRegisto } from "@/app/registo/actions"
import { FluxoOtp } from "@/components/auth/fluxo-otp"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FormularioRegisto() {
  return (
    <FluxoOtp acaoEnviar={iniciarRegisto} acaoConfirmar={confirmarRegisto} rotuloEnviar="Continuar">
      <Field>
        <FieldLabel htmlFor="nome">Nome</FieldLabel>
        <Input id="nome" name="nome" required maxLength={120} autoComplete="name" className="h-11" />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          className="h-11"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel-national"
          // Aceita máscara; a action remove tudo o que não é dígito. O navegador
          // compila o pattern com a flag `v`, que exige escapar ( ) + - na classe.
          pattern="^[\d\s\(\)\+\-]{10,20}$"
          title="Informe o número com DDD (ex: (11) 99999-8888)"
          placeholder="(11) 99999-8888"
          className="h-11"
        />
        <FieldDescription>Os compradores falam com você por aqui.</FieldDescription>
      </Field>
    </FluxoOtp>
  )
}
