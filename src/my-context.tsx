import React from "react";

export const Context = React.createContext<any>(undefined);

export const UIProvider: React.FC = ({ children }) => {
    const [showTabs, setShowTabs] = React.useState(true);

    let state = {
        showTabs,
        setShowTabs,
    };

    return <Context.Provider value={state}>{children}</Context.Provider>;

}

export default Context;