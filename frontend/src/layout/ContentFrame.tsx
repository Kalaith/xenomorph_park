import { ReactNode } from 'react';

interface ContentFrameProps {
  children: ReactNode;
}

export function ContentFrame({ children }: ContentFrameProps) {
  return (
    <main id="main-content" className="motion-fade-in min-w-0">
      {children}
    </main>
  );
}
