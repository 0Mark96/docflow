/**
 * Static example of what DocFlow reads from a contract: highlighted sentences on the
 * left, extracted values below. Synthetic data, as in the mockup.
 */
const mark =
  "rounded-[2px] bg-ai-soft px-0.5 text-foreground underline decoration-ai decoration-dotted decoration-2 underline-offset-4";

const values = [
  { label: "Fornitore", value: "Bianchi Servizi S.p.A." },
  { label: "Tipo", value: "Contratto" },
  { label: "Importo", value: "12.000,00 €", numeric: true },
  { label: "Scadenza", value: "31/03/2027", numeric: true },
];

export function ExtractionExample() {
  return (
    <figure className="border-line bg-panel m-0 grid gap-3.5 rounded-[18px] border px-6.5 pt-6.5 pb-4.5">
      <div
        aria-hidden="true"
        className="border-line bg-background shadow-card mr-7 -rotate-1 border px-5.5 pt-4.5 pb-1.5 text-[13px] leading-[1.75] text-[#454b57] max-[820px]:mr-0"
      >
        <div className="border-line text-faint mb-3 flex items-center gap-2 border-b pb-2 text-xs">
          <span className="text-err rounded-[3px] border border-[#f2c9c4] px-1 text-[9px] font-bold">
            PDF
          </span>
          contratto_bianchi.pdf
        </div>
        <p className="mb-2.5">
          <b className="text-foreground font-semibold">
            <mark className={mark}>CONTRATTO</mark> DI FORNITURA SERVIZI
          </b>
        </p>
        <p className="mb-2.5">
          Tra Officina Esempio S.r.l. e{" "}
          <mark className={mark}>Bianchi Servizi S.p.A.</mark>, con sede in Via
          Roma 12, Milano, si conviene quanto segue.
        </p>
        <p className="mb-2.5">
          <b className="text-foreground font-semibold">Art. 3.</b> Il
          corrispettivo è fissato in <mark className={mark}>12.000,00 €</mark>{" "}
          oltre IVA, in due rate.
        </p>
        <p className="mb-2.5">
          <b className="text-foreground font-semibold">Art. 4.</b>{" "}
          L&apos;accordo ha validità fino al{" "}
          <mark className={mark}>31/03/2027</mark> e non si rinnova tacitamente.
        </p>
      </div>

      <dl className="border-line bg-background shadow-pop relative mt-[-34px] mr-[-10px] ml-4.5 grid grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] gap-x-4 gap-y-2.5 rounded-xl border px-4 py-3.5 max-[820px]:mx-0 max-[820px]:grid-cols-2">
        {values.map(({ label, value, numeric }) => (
          <div key={label} className="min-w-0">
            <dt className="text-faint text-[11.5px]">{label}</dt>
            <dd
              className={`m-0 text-sm leading-[1.3] font-medium ${numeric ? "tabular-nums" : ""}`}
            >
              {value}
              <span
                aria-hidden="true"
                className="border-ai mt-[3px] block w-[22px] border-t-2 border-dotted"
              />
            </dd>
          </div>
        ))}
        <div className="border-line text-muted col-span-full flex items-center gap-[7px] border-t pt-2.5 text-[12.5px]">
          <span
            aria-hidden="true"
            className="border-ai w-3.5 flex-none border-t-2 border-dotted"
          />
          Letto dall&apos;AI, ogni valore porta alla sua frase
        </div>
      </dl>

      <figcaption className="text-muted px-0.5 pt-0.5 text-[13px]">
        Esempio: DocFlow ha letto un contratto e ne ha messo i dati in tabella.
      </figcaption>
    </figure>
  );
}
