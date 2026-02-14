import { ReactNode } from 'react';

interface AppShellProps {
  topBar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ topBar, sidebar, children }: AppShellProps) {
  return (
    <div className="min-h-screen app-bg text-slate-100">
      {topBar}
      <div className="mx-auto w-full max-w-[1600px] px-3 pb-6 sm:px-4 lg:px-6">
        <div className="mt-3 grid grid-cols-1 gap-4 lg:mt-4 lg:gap-6 lg:grid-cols-[240px_1fr]">
          {sidebar}
          {children}
        </div>
      </div>
    </div>
  );
}
