export const setUserState = (payload_username : any, payload_email : any, hasLoaded : boolean) => {
    return { type: 'SET_USER_STATE', payload_username, payload_email, hasLoaded};
}

export const setHomeHasLoaded = (hasLoaded : boolean) => {
    return { type: 'SET_HOME_HAS_LOADED', hasLoaded};
}