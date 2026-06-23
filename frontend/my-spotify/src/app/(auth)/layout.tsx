export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}