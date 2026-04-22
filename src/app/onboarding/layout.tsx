import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valorem · Configurazione iniziale",
  description: "Configura il tuo profilo per iniziare.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}