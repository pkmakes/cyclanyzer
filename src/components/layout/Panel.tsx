import type { ReactNode } from 'react';

type PanelProps = {
  title?: string;
  className?: string;
  children: ReactNode;
};

export function Panel({ title, className = '', children }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {title && <h2 className="panel__title">{title}</h2>}
      <div className="panel__body">{children}</div>
    </section>
  );
}
