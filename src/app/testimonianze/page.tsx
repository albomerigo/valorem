import { Metadata } from "next";
import { TestimonianzeView } from "./testimonianze-view";

export const metadata: Metadata = {
  title: "Testimonianze degli Utenti | Valorem",
  description: "Cosa dicono i nostri utenti sull'esperienza con Valorem, il finance coach comportamentale.",
};

export default function TestimonianzePage() {
  return <TestimonianzeView />;
}
