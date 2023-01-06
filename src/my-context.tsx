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
}

export const Context = React.createContext<ContextType | null>(null);
export const ContextProvider = ({ children } : Props) => {
  const [showTabs, setShowTabs] = React.useState<boolean>(false);
  const [darkMode, setDarkMode] = React.useState<boolean>(false);
  const [schoolColorToggled, setSchoolColorToggled] = React.useState<boolean>(false);
  const [sensitivityToggled, setSensitivityToggled] = React.useState<boolean>(false);

  const memoizedContextValue = React.useMemo(() => ({
    showTabs, setShowTabs, darkMode, setDarkMode, schoolColorToggled, setSchoolColorToggled, sensitivityToggled, setSensitivityToggled
  }), [showTabs, setShowTabs, darkMode, setDarkMode, schoolColorToggled, setSchoolColorToggled, sensitivityToggled, setSensitivityToggled]);

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


/* User Info Context */
export type UserContextType = {
  schoolName : string | null;
  setSchoolName : React.Dispatch<React.SetStateAction<string | null>>;
}

export const UserContext = React.createContext<UserContextType | null>(null);
export const UserContextProvider = ({ children } : Props) => {
  const [schoolName, setSchoolName] = React.useState<string | null>(null);

  const memoizedUserContextValue = React.useMemo(() => ({
    schoolName, setSchoolName
  }), [schoolName, setSchoolName]);

  return (
    <UserContext.Provider value={memoizedUserContextValue}> { children } </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = React.useContext(UserContext);
  if(!context) {
    throw new Error("Tabs context error");
  }
  return context;
}
