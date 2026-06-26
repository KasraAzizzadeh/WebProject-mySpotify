type AlertProps = {
  message?: string | null;
};

export default function Alert({ message }: AlertProps) {
  if (!message) return null;

  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
      <p className="text-sm text-red-500">
        {message}
      </p>
    </div>
  );
}