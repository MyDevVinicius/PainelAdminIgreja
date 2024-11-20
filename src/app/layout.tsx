import "../app/styles/globals.css";
export const metadata = {
  title: "Painel Admin | Ministerio Digital",
  description: "Painel Administrativo para gerenciar Clientes ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
