import { createContext, useContext, ReactNode } from "react";

interface FloatingTextContextType {
  addResourceChange: (
    resource: string,
    amount: number,
    element?: HTMLElement,
  ) => void;
  addFloatingText: (
    text: string,
    position: { x: number; y: number },
    color?: string,
    duration?: number,
    size?: "sm" | "md" | "lg",
  ) => void;
}

const FloatingTextContext = createContext<FloatingTextContextType | null>(null);

export function useFloatingTextContext() {
  const context = useContext(FloatingTextContext);
  if (!context) {
    // Return no-op functions if context is not available
    return {
      addResourceChange: () => {},
      addFloatingText: () => {},
    };
  }
  return context;
}

export function FloatingTextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FloatingTextContextType;
}) {
  return (
    <FloatingTextContext.Provider value={value}>
      {children}
    </FloatingTextContext.Provider>
  );
}
