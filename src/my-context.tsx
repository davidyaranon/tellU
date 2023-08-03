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
  initLoad: boolean;
  setInitLoad: React.Dispatch<React.SetStateAction<boolean>>;
  sensitivityToggled : boolean;
  setSensitivityToggled : React.Dispatch<React.SetStateAction<boolean>>;
}

export const Context = React.createContext<ContextType | null>(null);
export const ContextProvider = ({ children } : Props) => {
  const [showTabs, setShowTabs] = React.useState<boolean>(false);
  const [darkMode, setDarkMode] = React.useState<boolean>(false);
  const [initLoad, setInitLoad] = React.useState<boolean>(false);
  const [schoolColorToggled, setSchoolColorToggled] = React.useState<boolean>(false);
  const [sensitivityToggled, setSensitivityToggled] = React.useState<boolean>(false);

  const memoizedContextValue = React.useMemo(() => ({
    showTabs, setShowTabs, darkMode, setDarkMode, schoolColorToggled, setSchoolColorToggled, initLoad, setInitLoad, sensitivityToggled, setSensitivityToggled
  }), [showTabs, setShowTabs, darkMode, setDarkMode, schoolColorToggled, setSchoolColorToggled, initLoad, setInitLoad, sensitivityToggled, setSensitivityToggled]);

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
