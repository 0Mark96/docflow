import { Suspense } from "react";

import { Logo } from "@/components/app-shell/logo";
import { buttonClasses } from "@/components/ui/button";

import { ExtractionExample } from "./_login/extraction-example";
import { LoginForm } from "./_login/login-form";

const steps = [
  {
    title: "Carichi i file",
    text: "PDF, testo o fattura elettronica XML. Anche più file insieme, trascinandoli.",
  },
  {
    title: "Controlli i dati",
    text: "Fornitore, importo e scadenza finiscono in una tabella. Se un valore è incerto te lo segnaliamo, e lo correggi con un clic.",
  },
  {
    title: "Fai domande",
    text: "Scrivi come parleresti a un collega. La risposta cita il documento, e se non c'è te lo dice.",
  },
];

const trust = [
  {
    title: "Le fatture elettroniche non passano dall'AI.",
    text: "Il file XML viene letto riga per riga, quindi i valori sono esatti. L'AI serve solo per PDF e testi.",
  },
  {
    title: "Vedi sempre da dove arriva un dato.",
    text: "Ogni valore ha un segno: verde se viene dalla fattura XML, arancio se l'ha letto l'AI, blu se l'avete controllato voi.",
  },
  {
    title: "I documenti restano della tua azienda.",
    text: "Ogni azienda vede solo i propri file, e ogni caricamento, correzione o eliminazione resta registrata.",
  },
];

/** Public first page: presents DocFlow and holds the login form (ADR 0004). */
export default function LoginPage({ searchParams }: PageProps<"/">) {
  return (
    <div className="bg-background min-h-full">
      <header className="border-line sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white/90 px-4 py-3.5 backdrop-blur-sm max-[820px]:static">
        <Logo />
        <a href="#accedi" className={buttonClasses()}>
          Accedi
        </a>
      </header>

      <main className="mx-auto flex max-w-[1180px] flex-col gap-11 px-4 pt-10 pb-16 max-[820px]:gap-8 max-[820px]:pt-6 max-[820px]:pb-12">
        <section className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-12 pt-4.5 pb-2 max-[1020px]:grid-cols-1 max-[1020px]:gap-7">
          <div>
            <h1 className="max-w-[15ch] text-[clamp(30px,3.9vw,46px)] leading-[1.08] font-semibold tracking-[-0.035em] text-balance">
              Carichi una fattura. DocFlow ti dice chi pagare, quanto ed entro
              quando.
            </h1>
            <p className="text-muted mt-4.5 max-w-[46ch] text-[17px] leading-relaxed">
              Fatture, contratti e preventivi sparsi tra email e cartelle?
              DocFlow li legge per te, mette i dati importanti in una tabella e
              risponde alle tue domande indicando sempre il documento da cui
              prende la risposta.
            </p>
            <Suspense fallback={<LoginForm />}>
              <LoginFormWithLinkError searchParams={searchParams} />
            </Suspense>
          </div>
          <ExtractionExample />
        </section>

        <section
          aria-labelledby="how-title"
          className="border-line grid gap-4.5 border-t pt-7"
        >
          <h2
            id="how-title"
            className="text-[19px] font-semibold tracking-[-0.015em]"
          >
            Tre passaggi, nient&apos;altro da imparare
          </h2>
          <ol className="grid grid-cols-3 gap-7 max-[820px]:grid-cols-1 max-[820px]:gap-4.5">
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="border-accent text-accent grid size-7 flex-none place-items-center rounded-full border-[1.5px] text-[13px] font-semibold"
                >
                  {index + 1}
                </span>
                <div>
                  <b className="text-[15px] font-semibold">{step.title}</b>
                  <p className="text-muted mt-1 text-sm">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-label="Perché fidarsi"
          className="grid grid-cols-3 gap-7 max-[820px]:grid-cols-1 max-[820px]:gap-4.5"
        >
          {trust.map((item) => (
            <div key={item.title}>
              <b className="text-[14.5px] font-semibold">{item.title}</b>
              <p className="text-muted mt-1 text-sm">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="border-line flex flex-wrap items-center justify-between gap-4 border-t pt-7">
          <b className="text-[19px] font-semibold tracking-[-0.015em]">
            Pronto a provarlo con i tuoi documenti?
          </b>
          <a
            href="#accedi"
            className={buttonClasses({ variant: "primary", size: "lg" })}
          >
            Accedi
          </a>
        </section>
      </main>
    </div>
  );
}

/** Reads ?error=link, set by /auth/confirm when a login link is expired or already used. */
async function LoginFormWithLinkError({
  searchParams,
}: Pick<PageProps<"/">, "searchParams">) {
  const { error } = await searchParams;
  return <LoginForm linkError={error === "link"} />;
}
