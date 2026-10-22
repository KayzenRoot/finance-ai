import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance AI — clareza para suas decisões financeiras",
  description:
    "Organize as finanças pessoais e da loja com prioridades explicáveis e controle nas mãos do titular.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
