import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RedefinirSenhaForm } from "./RedefinirSenhaForm";

export default async function RedefinirSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6 py-12 text-center">
        <h1 className="font-display text-xl font-bold text-foreground mb-2">Link inválido ou expirado</h1>
        <p className="text-sm text-muted mb-6">
          Esse link de redefinição de senha não é mais válido. Solicite um novo para continuar.
        </p>
        <Link
          href="/recuperar-senha"
          className="inline-flex items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-brand-foreground font-semibold h-11 px-6 text-sm transition-colors mx-auto"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Criar nova senha</h1>
      <p className="text-sm text-muted mb-8">Escolha uma nova senha para sua conta.</p>
      <RedefinirSenhaForm />
    </div>
  );
}
