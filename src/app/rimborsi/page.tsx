import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Valorem · Politica di Rimborso",
};

export default function RimborsiPage() {
  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "#0D0A1E" }}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] transition-opacity hover:opacity-70"
          style={{ color: "rgba(168,139,250,0.7)" }}
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Link>

        <h1 className="mt-6 font-serif text-[36px] font-normal italic leading-tight text-white">
          Politica di Rimborso
        </h1>
        <p className="mt-2 text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          Ultimo aggiornamento: maggio 2026
        </p>

        <div
          className="mt-10 rounded-2xl p-8 space-y-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {[
            {
              title: "1. Diritto di recesso",
              body: "Ai sensi della normativa europea (Direttiva 2011/83/UE) e del Codice del Consumo italiano, hai diritto di recedere dal contratto entro 14 giorni dalla data di sottoscrizione del piano a pagamento, senza dover fornire alcuna motivazione.",
            },
            {
              title: "2. Come richiedere un rimborso",
              body: "Per richiedere un rimborso entro i 14 giorni, invia una email a support@valorem.app indicando il tuo indirizzo email di registrazione e la data di acquisto. Il rimborso verrà elaborato entro 5-10 giorni lavorativi tramite lo stesso metodo di pagamento utilizzato.",
            },
            {
              title: "3. Rimborsi oltre i 14 giorni",
              body: "Dopo il periodo di 14 giorni non è previsto un rimborso automatico. Tuttavia valutiamo ogni caso singolarmente. Se hai riscontrato problemi tecnici gravi o circostanze eccezionali, contattaci e faremo del nostro meglio per trovare una soluzione equa.",
            },
            {
              title: "4. Cancellazione abbonamento",
              body: "Puoi cancellare il tuo abbonamento in qualsiasi momento dalla pagina Impostazioni → Piano. La cancellazione è immediata: il tuo piano rimarrà attivo fino alla fine del periodo già pagato, dopodiché tornerai automaticamente al piano gratuito senza ulteriori addebiti.",
            },
            {
              title: "5. Pagamenti gestiti da Paddle",
              body: "I pagamenti sono gestiti da Paddle.com, il nostro Merchant of Record. Paddle è responsabile della raccolta dei pagamenti, della gestione dell'IVA e dell'elaborazione dei rimborsi. Per qualsiasi questione relativa ai pagamenti puoi contattare direttamente il supporto Paddle.",
            },
            {
              title: "6. Contatti",
              body: "Per qualsiasi domanda relativa a rimborsi o cancellazioni: support@valorem.app — risponderemo entro 48 ore lavorative.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2
                className="font-serif text-[18px] font-normal italic mb-3"
                style={{ color: "#A88BFA" }}
              >
                {section.title}
              </h2>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Link href="/privacy" className="hover:opacity-70 underline">Privacy Policy</Link>
          <Link href="/termini" className="hover:opacity-70 underline">Termini di Servizio</Link>
          <Link href="/pricing" className="hover:opacity-70 underline">Piani</Link>
        </div>
      </div>
    </div>
  );
}