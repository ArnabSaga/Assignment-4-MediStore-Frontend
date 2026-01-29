export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground fixed inset-0 ">
      {children}
    </main>
  );
}
