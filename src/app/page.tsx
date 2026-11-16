export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">DocFlow</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Carica fatture, contratti e preventivi: DocFlow estrae i dati e risponde
        alle tue domande citando le fonti.
      </p>
    </main>
  );
}
