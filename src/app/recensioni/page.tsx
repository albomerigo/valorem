import { Metadata } from "next";
import { RecensioniView } from "./recensioni-view";

export const metadata: Metadata = {
  title: "Recensioni degli Utenti | Valorem",
  description: "Cosa dicono i nostri utenti sull'esperienza con Valorem, il finance coach comportamentale.",
};

export default function RecensioniPage() {
  return <RecensioniView />;
}
