import type { Metadata } from "next";

import { FormularioLogin } from "@/components/auth/formulario-login";
import { PaginaAuth } from "@/components/auth/pagina-auth";

export const metadata: Metadata = {
  title: "Entrar - PEÇA",
};

export default function LoginPage() {
  return (
    <PaginaAuth
      titulo="Entrar"
      subtitulo="Informe seu email e receba um código de acesso."
      pergunta="Ainda não tem conta?"
      linkAlternativo={{ href: "/registo", rotulo: "Criar conta" }}
    >
      <FormularioLogin />
    </PaginaAuth>
  );
}
