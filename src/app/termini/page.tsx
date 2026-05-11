import Link from "next/link";

export const metadata = {
  title: "Termini di Servizio · Valorem",
};

export default function TerminiPage() {
  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "#0D0A1E" }}>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors"
            style={{ color: "rgba(168,139,250,0.7)" }}
          >
            ← Dashboard
          </Link>
          <h1 className="font-serif text-[36px] font-normal italic leading-tight text-white">
            Termini di Servizio
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Ultimo aggiornamento: maggio 2026
          </p>
        </div>

        {/* Content */}
        <div
          className="rounded-2xl p-8 text-[14px] leading-relaxed"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(168,139,250,0.12)",
            backdropFilter: "blur(16px)",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <Section title="1. Descrizione del servizio">
            <p>
              Valorem è un'applicazione web per la gestione delle finanze personali. Il Servizio
              permette agli utenti di registrare entrate e uscite, impostare obiettivi di risparmio,
              visualizzare statistiche di spesa e ricevere analisi comportamentali sui propri pattern
              finanziari.
            </p>
            <p className="mt-3">
              Valorem è uno strumento di supporto decisionale e non costituisce consulenza finanziaria,
              fiscale o legale. Le informazioni mostrate sono basate esclusivamente sui dati inseriti
              dall'utente.
            </p>
          </Section>

          <Section title="2. Accettazione dei termini">
            <p>
              Utilizzando Valorem accetti integralmente i presenti Termini di Servizio e la nostra{" "}
              <Link href="/privacy" style={{ color: "#A88BFA" }}>
                Privacy Policy
              </Link>
              . Se non accetti questi termini, ti chiediamo di non utilizzare il Servizio.
            </p>
          </Section>

          <Section title="3. Piani e accesso">
            <p className="mb-3">Valorem offre i seguenti piani:</p>
            <div className="space-y-4">
              <PlanCard
                name="Free"
                color="#A88BFA"
                features={[
                  "Fino a 50 transazioni al mese",
                  "1 obiettivo di risparmio attivo",
                  "Dashboard base con statistiche mensili",
                  "Accesso via web e PWA",
                ]}
              />
              <PlanCard
                name="Premium"
                color="#E879F9"
                features={[
                  "Transazioni illimitate",
                  "Obiettivi illimitati",
                  "Grafici avanzati e analisi comportamentale",
                  "Esportazione dati CSV",
                  "Supporto prioritario",
                ]}
              />
              <PlanCard
                name="Pro"
                color="#60A5FA"
                features={[
                  "Tutto di Premium",
                  "API access per integrazioni",
                  "Multi-account e condivisione familiare",
                  "Report mensili personalizzati via email",
                  "SLA garantito 99.9%",
                ]}
              />
            </div>
          </Section>

          <Section title="4. Obblighi dell'utente">
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Fornire informazioni accurate durante la registrazione e l'utilizzo.</li>
              <li>Mantenere riservate le credenziali di accesso al proprio account.</li>
              <li>Non utilizzare il Servizio per attività illegali o fraudolente.</li>
              <li>Non tentare di accedere ai dati di altri utenti.</li>
              <li>Non sovraccaricare i nostri server con richieste automatizzate non autorizzate.</li>
            </ul>
          </Section>

          <Section title="5. Limitazioni di responsabilità">
            <p>
              Valorem è fornito "così com'è" e "come disponibile". Nella misura consentita dalla legge
              applicabile, escludiamo qualsiasi garanzia implicita di commerciabilità, idoneità a uno
              scopo specifico e non violazione.
            </p>
            <p className="mt-3">
              Non siamo responsabili per:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>Perdite finanziarie derivanti da decisioni prese sulla base dei dati mostrati nell'app.</li>
              <li>Interruzioni del servizio dovute a manutenzione, guasti tecnici o cause di forza maggiore.</li>
              <li>Dati inseriti in modo errato dall'utente.</li>
              <li>Danni indiretti, incidentali o consequenziali di qualsiasi natura.</li>
            </ul>
            <p className="mt-3">
              La nostra responsabilità totale verso di te non supererà l'importo pagato per il Servizio
              negli ultimi 12 mesi.
            </p>
          </Section>

          <Section title="6. Sospensione e cancellazione">
            <p>
              Ci riserviamo il diritto di sospendere o terminare il tuo account in caso di violazione
              dei presenti Termini. Puoi cancellare il tuo account in qualsiasi momento dalle impostazioni
              dell'app. La cancellazione è immediata e comporta l'eliminazione di tutti i tuoi dati
              entro 30 giorni.
            </p>
          </Section>

          <Section title="7. Modifiche ai termini">
            <p>
              Ci riserviamo il diritto di modificare i presenti Termini in qualsiasi momento.
              Le modifiche saranno notificate via email con almeno 14 giorni di anticipo. Il continuato
              utilizzo del Servizio dopo tale periodo costituisce accettazione dei nuovi termini.
            </p>
          </Section>

          <Section title="8. Legge applicabile">
            <p>
              I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia
              è competente il Tribunale di Milano, salvo diversa disposizione di legge inderogabile
              applicabile al consumatore.
            </p>
          </Section>

          <Section title="9. Contatti">
            <p>
              Per domande sui presenti Termini scrivi a{" "}
              <a href="mailto:legal@valorem.app" style={{ color: "#A88BFA" }}>
                legal@valorem.app
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2
        className="mb-3 text-[16px] font-semibold"
        style={{ color: "#A88BFA" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function PlanCard({ name, color, features }: { name: string; color: string; features: string[] }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}30`,
      }}
    >
      <p className="mb-2 text-[13px] font-semibold" style={{ color }}>
        Piano {name}
      </p>
      <ul className="ml-3 list-disc space-y-1 text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
