import type { Metadata } from "next";
import { LandingView } from "./landing-view";

export const metadata: Metadata = {
  title: "Valorem — Finance Coach Comportamentale",
  description:
    "Valorem traduce ogni euro in tempo di vita, osserva le tue abitudini e a fine mese ti racconta chi sei diventato.",
  openGraph: {
    title: "Valorem — Finance Coach Comportamentale",
    description: "Non sono una banca. Sono un coach. Ogni euro che spendi è tempo della tua vita.",
    url: "https://valorem.app",
    type: "website",
  },
};

export default function LandingPage() {
  return <LandingView />;
}
