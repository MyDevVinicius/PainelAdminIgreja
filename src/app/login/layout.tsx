import "../styles/globals.css"; // Certifique-se de que o caminho está correto

export const metadata = {
  title: "Login Ministerio Digital",
  description: "",
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
