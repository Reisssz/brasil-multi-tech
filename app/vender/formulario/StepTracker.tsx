export type WizardStepId = "aparelho" | "condicoes" | "oferta" | "termos" | "checkout";

const STEPS: { id: WizardStepId; label: string; description: string }[] = [
  { id: "aparelho", label: "Aparelho", description: "Selecione marca, modelo e especificações do seu celular." },
  { id: "condicoes", label: "Condições", description: "Informe o estado funcional e estético do aparelho." },
  { id: "oferta", label: "Oferta", description: "Veja o valor proposto para o seu dispositivo." },
  { id: "termos", label: "Termos", description: "Leia e assine os termos do contrato." },
  { id: "checkout", label: "Checkout", description: "Escolha como deseja receber: Pix ou transferência." },
];

export function StepTracker({ current }: { current: WizardStepId }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="grid grid-cols-5 gap-1 mb-8">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.id} className="flex flex-col items-center text-center px-1">
            <div className="flex items-center w-full">
              <div className={`h-0.5 flex-1 ${index === 0 ? "invisible" : isDone ? "bg-success" : "bg-border"}`} />
              <span
                className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-full text-sm font-bold border-2 ${
                  isDone
                    ? "bg-success border-success text-white"
                    : isCurrent
                      ? "border-brand text-brand bg-brand-light"
                      : "border-border bg-[#eef0f3] text-muted"
                }`}
              >
                {isDone ? "✓" : isCurrent ? <span className="w-2 h-2 rounded-full bg-brand" /> : index + 1}
              </span>
              <div className={`h-0.5 flex-1 ${index === STEPS.length - 1 ? "invisible" : isDone ? "bg-success" : "bg-border"}`} />
            </div>
            <span className={`mt-2 text-xs sm:text-sm font-bold ${isDone ? "text-success" : isCurrent ? "text-foreground" : "text-muted"}`}>
              {step.label}
            </span>
            <span className="hidden sm:block mt-0.5 text-[11px] text-muted leading-snug max-w-[140px]">
              {step.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}
