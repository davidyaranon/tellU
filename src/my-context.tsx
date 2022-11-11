import React from "react";

type Props = {
  children: React.ReactNode;
}

export type TabsContextType = {
  showTabs : boolean;
  setShowTabs : React.Dispatch<React.SetStateAction<boolean>>;
}

export const TabsContext = React.createContext<TabsContextType | null>(null);
export const TabsContextProvider = ({ children } : Props) => {
  const [showTabs, setShowTabs] = React.useState<boolean>(false);

  const memoizedContextValue = React.useMemo(() => ({
    showTabs, setShowTabs
  }), [showTabs, setShowTabs]);

  return(
    <TabsContext.Provider value={memoizedContextValue}> { children } </TabsContext.Provider>
  )
};

export const useTabsContext = () => {
  const tabsContext = React.useContext(TabsContext);
  if(!tabsContext) {
    throw new Error("Context error");
  }
  return tabsContext;
}
