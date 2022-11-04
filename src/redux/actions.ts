export const setUserState = (payload_username: any, payload_email: any, hasLoaded: boolean, school: string) => {
  return { type: 'SET_USER_STATE', payload_username, payload_email, hasLoaded, school };
};

export const setNotificationCount = (count: number) => {
  return { type: 'SET_NOTIIFICATION_COUNT', count };
};

export const setDarkMode = (toggled: boolean) => {
  return { type: 'SET_DARK_MODE', toggled };
};

export const setSchoolColorPallete = (colorToggled : boolean) => {
  return { type: 'SET_SCHOOL_COLOR_PALLETE', colorToggled }
}

export const setSensitiveContent = (sensitiveContent : boolean) => {
  return { type: 'SET_SENSITIVE_CONTENT', sensitiveContent }
}

export const setNotif = (notifSet : boolean) => {
  return { type : 'SET_NOTIF', notifSet }
}

export const setMinimal = (minimal : boolean) => {
  return { type : 'SET_MINIMAL', minimal }
}