import React, { createContext, useContext, useState, useCallback } from 'react';

type CursorState = 'default' | 'interactive' | 'drag' | 'text';

interface CursorContextType {
  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;
}

const CursorContext = createContext<CursorContextType>({
  cursorState: 'default',
  setCursorState: () => {},
});

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [cursorState, setCursorState] = useState<CursorState>('default');

  const handleSetCursorState = useCallback((state: CursorState) => {
    setCursorState(state);
  }, []);

  return (
    <CursorContext.Provider
      value={{
        cursorState,
        setCursorState: handleSetCursorState,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  return useContext(CursorContext);
}
