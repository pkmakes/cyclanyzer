import { useEffect } from 'react';

export type ToastMessage = {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
};

type ToastProps = {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
};

export function ToastContainer({ messages, onDismiss }: ToastProps) {
  return (
    <div className="toast-container">
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(message.id), 4000);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  return (
    <div className={`toast toast--${message.type}`} onClick={() => onDismiss(message.id)}>
      {message.text}
    </div>
  );
}
