"use client"

import { confirmarCodigo, enviarCodigo } from "@/app/login/actions"
import { FluxoOtp } from "@/components/auth/fluxo-otp"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FormularioLogin() {
  return (
    <FluxoOtp acaoEnviar={enviarCodigo} acaoConfirmar={confirmarCodigo} rotuloEnviar="Continuar">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          placeholder="voce@email.com"
          className="h-11"
        />
        <FieldDescription>Vamos enviar um código de acesso. Sem senha para decorar.</FieldDescription>
      </Field>
    </FluxoOtp>
  )
}
