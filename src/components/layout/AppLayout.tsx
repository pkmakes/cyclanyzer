import type { ReactNode } from 'react';

type AppLayoutProps = {
  header: ReactNode;
  leftColumn: ReactNode;
  rightColumn: ReactNode;
};

export function AppLayout({ header, leftColumn, rightColumn }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <header className="app-header">{header}</header>
      <main className="app-main">
        <div className="app-main__left">{leftColumn}</div>
        <div className="app-main__right">{rightColumn}</div>
      </main>
    </div>
  );
}
