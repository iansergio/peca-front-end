"use client"

import { entrar } from "@/app/login/actions"
import { FormularioAuth } from "@/components/auth/formulario-auth"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FormularioLogin() {
  return (
    <FormularioAuth acao={entrar} rotuloEnviar="Entrar" rotuloEnviando="Entrando...">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" required autoComplete="email" className="h-10" />
      </Field>
      <Field>
        <FieldLabel htmlFor="senha">Senha</FieldLabel>
        <Input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="h-10"
        />
      </Field>
    </FormularioAuth>
  )
}
