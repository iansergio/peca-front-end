"use client"

import { registar } from "@/app/registo/actions"
import { FormularioAuth } from "@/components/auth/formulario-auth"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function FormularioRegisto() {
  return (
    <FormularioAuth acao={registar} rotuloEnviar="Criar conta" rotuloEnviando="Criando conta...">
      <Field>
        <FieldLabel htmlFor="nome">Nome</FieldLabel>
        <Input id="nome" name="nome" required maxLength={120} autoComplete="name" className="h-10" />
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
          className="h-10"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="senha">Senha</FieldLabel>
        <Input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          className="h-10"
        />
        <FieldDescription>Mínimo de 8 caracteres.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="whatsapp">
          WhatsApp <span className="font-normal text-muted-foreground">(opcional)</span>
        </FieldLabel>
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          // Aceita máscara; a action remove tudo o que não é dígito. O navegador
          // compila o pattern com a flag `v`, que exige escapar ( ) + - na classe.
          pattern="^[\d\s\(\)\+\-]{10,20}$"
          title="Informe o número com DDD (ex: (11) 99999-8888)"
          placeholder="(11) 99999-8888"
          className="h-10"
        />
        <FieldDescription>Os compradores falam com você por aqui.</FieldDescription>
      </Field>
    </FormularioAuth>
  )
}
