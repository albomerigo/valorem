import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · Valorem",
};

export default function PrivacyPage() {
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
            Privacy Policy
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
          <Section title="1. Titolare del trattamento">
            <p>
              Il titolare del trattamento dei dati personali è Valorem (di seguito "noi" o "il Servizio").
              Per qualsiasi questione relativa alla privacy puoi contattarci all'indirizzo:{" "}
              <a href="mailto:privacy@valorem.app" style={{ color: "#A88BFA" }}>
                privacy@valorem.app
              </a>
            </p>
          </Section>

          <Section title="2. Dati raccolti">
            <p className="mb-3">Raccogliamo le seguenti categorie di dati personali:</p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>Dati di registrazione:</strong>{" "}
                indirizzo email, nome utente fornito durante l'onboarding.
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>Dati finanziari:</strong>{" "}
                transazioni (importo, data, categoria, commerciante), obiettivi di risparmio, reddito mensile dichiarato, costi fissi.
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>Dati di utilizzo:</strong>{" "}
                log di accesso, preferenze dell'app (tema, metrica del tempo).
              </li>
            </ul>
            <p className="mt-3">
              Non raccogliamo dati bancari, carte di credito o credenziali di accesso a istituti finanziari.
              I dati finanziari sono inseriti manualmente dall'utente.
            </p>
          </Section>

          <Section title="3. Finalità del trattamento">
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Fornitura e personalizzazione del Servizio (calcolo budget, obiettivi, statistiche).</li>
              <li>Autenticazione e sicurezza dell'account.</li>
              <li>Miglioramento del prodotto tramite dati aggregati e anonimi.</li>
              <li>Comunicazioni di servizio (notifiche importanti sull'account).</li>
            </ul>
          </Section>

          <Section title="4. Base giuridica (GDPR)">
            <p>
              Il trattamento si basa sull'esecuzione del contratto di servizio (art. 6(1)(b) GDPR)
              e sul legittimo interesse al miglioramento del prodotto (art. 6(1)(f) GDPR).
              Dove richiesto, ti chiediamo il consenso esplicito.
            </p>
          </Section>

          <Section title="5. Provider e sub-responsabili">
            <p>
              I dati sono archiviati e gestiti tramite{" "}
              <strong style={{ color: "rgba(255,255,255,0.9)" }}>Supabase</strong> (database PostgreSQL
              con crittografia a riposo e in transito, conforme al GDPR). Supabase opera come responsabile
              del trattamento ai sensi dell'art. 28 GDPR.
            </p>
            <p className="mt-3">
              I server possono essere ubicati nell'Unione Europea o in paesi con decisione di adeguatezza
              della Commissione Europea.
            </p>
          </Section>

          <Section title="6. Conservazione dei dati">
            <p>
              I dati sono conservati per tutta la durata del tuo account. In caso di cancellazione
              dell'account, i dati personali sono eliminati entro 30 giorni. Dati aggregati e anonimi
              possono essere conservati a tempo indeterminato.
            </p>
          </Section>

          <Section title="7. I tuoi diritti (GDPR art. 15-22)">
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong style={{ color: "rgba(255,255,255,0.9)" }}>Accesso:</strong> puoi richiedere una copia dei tuoi dati.</li>
              <li><strong style={{ color: "rgba(255,255,255,0.9)" }}>Rettifica:</strong> puoi correggere dati inesatti direttamente dall'app.</li>
              <li><strong style={{ color: "rgba(255,255,255,0.9)" }}>Cancellazione:</strong> puoi eliminare il tuo account e tutti i dati associati.</li>
              <li><strong style={{ color: "rgba(255,255,255,0.9)" }}>Portabilità:</strong> puoi esportare i tuoi dati in formato CSV dalle impostazioni.</li>
              <li><strong style={{ color: "rgba(255,255,255,0.9)" }}>Opposizione:</strong> puoi opporti al trattamento per legittimo interesse.</li>
              <li><strong style={{ color: "rgba(255,255,255,0.9)" }}>Reclamo:</strong> hai il diritto di presentare reclamo al Garante per la Protezione dei Dati Personali.</li>
            </ul>
            <p className="mt-3">
              Per esercitare i tuoi diritti scrivi a{" "}
              <a href="mailto:privacy@valorem.app" style={{ color: "#A88BFA" }}>
                privacy@valorem.app
              </a>
              . Risponderemo entro 30 giorni.
            </p>
          </Section>

          <Section title="8. Cookie e storage locale">
            <p>
              Utilizziamo il localStorage del browser per salvare le preferenze dell'app (tema, sessione).
              Non utilizziamo cookie di tracciamento o pubblicitari.
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
