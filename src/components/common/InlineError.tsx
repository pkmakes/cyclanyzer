type InlineErrorProps = {
  message: string | null;
};

export function InlineError({ message }: InlineErrorProps) {
  if (!message) return null;
  return <div className="inline-error">{message}</div>;
}
