export const setUserState = (payload_username: any, payload_email: any, hasLoaded: boolean, school: string) => {
  return { type: 'SET_USER_STATE', payload_username, payload_email, hasLoaded, school };
};

export const setNotificationCount = (count: number) => {
  return { type: 'SET_NOTIIFICATION_COUNT', count };
};

export const setDarkMode = (toggled: boolean) => {
  return { type: 'SET_DARK_MODE', toggled };
};