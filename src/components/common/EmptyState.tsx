type EmptyStateProps = {
  message: string;
  sub?: string;
};

export function EmptyState({ message, sub }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__message">{message}</p>
      {sub && <p className="empty-state__sub">{sub}</p>}
    </div>
  );
}
