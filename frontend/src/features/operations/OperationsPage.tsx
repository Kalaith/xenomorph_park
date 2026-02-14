import { ReactNode, useState } from 'react';
import { BuildDock } from './BuildDock';

interface OperationsPageProps {
  gameGrid: ReactNode;
}

export function OperationsPage({ gameGrid }: OperationsPageProps) {
  const [dockHidden, setDockHidden] = useState(false);

  return (
    <section className={`${dockHidden ? 'pb-16' : 'pb-56 sm:pb-60'}`}>
      <div className="min-w-0">{gameGrid}</div>
      <BuildDock hidden={dockHidden} onToggleHidden={() => setDockHidden(value => !value)} />
    </section>
  );
}
