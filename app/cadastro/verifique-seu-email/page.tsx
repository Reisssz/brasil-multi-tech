export default function VerifiqueSeuEmail() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 sm:px-6 text-center">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Confirme seu e-mail</h1>
      <p className="text-sm text-muted">
        Enviamos um link de confirmação para o e-mail informado. Clique nele
        para ativar sua conta.
      </p>
    </div>
  );
}
