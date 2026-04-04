'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be used within <Tabs>');
  return ctx;
}

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultTab, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      className={cn('flex border-b border-surface-border gap-0', className)}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function TabTrigger({ id, children, className }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
      className={cn(
        'px-4 py-3 text-body-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
        isActive
          ? 'border-primary-400 text-primary-600'
          : 'border-transparent text-muted hover:text-foreground hover:border-surface-border',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabContentProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ id, children, className }: TabContentProps) {
  const { activeTab } = useTabs();
  if (activeTab !== id) return null;

  return (
    <div role="tabpanel" className={cn('py-4', className)}>
      {children}
    </div>
  );
}
