import React from "react";

type Props = {
  children: React.ReactNode;
}

/* Tabs and Dark mode Context */
export type ContextType = {
  showTabs : boolean;
  setShowTabs : React.Dispatch<React.SetStateAction<boolean>>;
  darkMode : boolean;
  setDarkMode : React.Dispatch<React.SetStateAction<boolean>>;
  schoolColorToggled : boolean;
  setSchoolColorToggled : React.Dispatch<React.SetStateAction<boolean>>;
  sensitivityToggled : boolean;
  setSensitivityToggled : React.Dispatch<React.SetStateAction<boolean>>;
  mapTilerId: string;
  setMapTilerId: React.Dispatch<React.SetStateAction<string>>;
}

export const Context = React.createContext<ContextType | null>(null);
export const ContextProvider = ({ children } : Props) => {
  const [showTabs, setShowTabs] = React.useState<boolean>(false);
  const [darkMode, setDarkMode] = React.useState<boolean>(false);
  const [mapTilerId, setMapTilerId] = React.useState<string>('streets');
  const [schoolColorToggled, setSchoolColorToggled] = React.useState<boolean>(false);
  const [sensitivityToggled, setSensitivityToggled] = React.useState<boolean>(false);

  const memoizedContextValue = React.useMemo(() => ({
    showTabs, setShowTabs, darkMode, setDarkMode, schoolColorToggled, setSchoolColorToggled, mapTilerId, setMapTilerId, sensitivityToggled, setSensitivityToggled
  }), [showTabs, setShowTabs, darkMode, setDarkMode, schoolColorToggled, setSchoolColorToggled, mapTilerId, setMapTilerId, sensitivityToggled, setSensitivityToggled]);

  return(
    <Context.Provider value={memoizedContextValue}> { children } </Context.Provider>
  )
};

export const useContext = () => {
  const context = React.useContext(Context);
  if(!context) {
    throw new Error("Tabs context error");
  }
  return context;
}
