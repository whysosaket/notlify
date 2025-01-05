import { useState } from 'react';
import { Tab } from '../types';

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);

  const openTab = (noteId: string) => {
    if (tabs.some(tab => tab.id === noteId)) {
      setTabs(tabs.map(tab => ({
        ...tab,
        isActive: tab.id === noteId,
      })));
      return;
    }

    const newTab: Tab = {
      id: noteId,
      isActive: true,
    };

    setTabs(tabs.map(tab => ({
      ...tab,
      isActive: false,
    })).concat(newTab));
  };

  const closeTab = (id: string) => {
    const tabIndex = tabs.findIndex(tab => tab.id === id);
    if (tabs[tabIndex]?.isActive && tabs.length > 1) {
      const newActiveIndex = tabIndex === tabs.length - 1 ? tabIndex - 1 : tabIndex + 1;
      setTabs(tabs.filter(tab => tab.id !== id).map((tab, index) => ({
        ...tab,
        isActive: index === newActiveIndex,
      })));
    } else {
      setTabs(tabs.filter(tab => tab.id !== id));
    }
  };

  return {
    tabs,
    openTab,
    closeTab,
  };
}