import type { Metadata } from "next";

import { FormularioRegisto } from "@/components/auth/formulario-registo";
import { PaginaAuth } from "@/components/auth/pagina-auth";

export const metadata: Metadata = {
  title: "Criar conta - PEÇA",
};

export default function RegistoPage() {
  return (
    <PaginaAuth
      titulo="Criar conta"
      subtitulo="Cadastre-se para vender suas peças. Você confirma o email com um código, sem senha."
      pergunta="Já tem conta?"
      linkAlternativo={{ href: "/login", rotulo: "Entrar" }}
    >
      <FormularioRegisto />
    </PaginaAuth>
  );
}
