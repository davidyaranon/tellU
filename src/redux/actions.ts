export const setUserState = (payload_username : any, payload_email : any, hasLoaded : boolean, school : string) => {
    return { type: 'SET_USER_STATE', payload_username, payload_email, hasLoaded, school};
}

export const setHomeHasLoaded = (hasLoaded : boolean) => {
    return { type: 'SET_HOME_HAS_LOADED', hasLoaded};
}

// export const setAllUserPosts = (allPosts : any, userPostsLoaded: boolean, scrollY : number) => {
//   return { type: 'SET_ALL_POSTS', allPosts, userPostsLoaded, scrollY };
// }

export const setDarkMode = (toggled : boolean) => {
    return { type: 'SET_DARK_MODE', toggled};
}