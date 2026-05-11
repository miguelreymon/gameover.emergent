
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext<any>(null);

export function ConfigProvider({ children, initialConfig }: { children: React.ReactNode, initialConfig: any }) {
  const [config, setConfig] = useState(initialConfig);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
