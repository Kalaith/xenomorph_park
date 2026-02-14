import { ReactNode } from 'react';
import { FloatingTextContext, FloatingTextContextType } from './floatingTextContextValue';

export function FloatingTextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FloatingTextContextType;
}) {
  return <FloatingTextContext.Provider value={value}>{children}</FloatingTextContext.Provider>;
}
