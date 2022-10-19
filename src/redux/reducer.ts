const defaultState = {
  user: {},
  email: {},
  hasLoaded: {},
  toggled: {},
  school: {},
  colorToggled: {},
  notificationCount: 0,
  notifSet : false,
  minimal : false,
}


export default function reducer(state = defaultState, { type, payload_username, payload_email, hasLoaded, toggled, colorToggled, school, notificationCount, notifSet, minimal}
  : { type: string, payload_username: any, payload_email: any, hasLoaded: boolean, toggled: boolean, colorToggled : boolean, school: string, notificationCount: number, notifSet : boolean, minimal : boolean})
  : any {

  switch (type) {
    case 'SET_USER_STATE':
      return {
        ...state,
        user: {
          username: payload_username,
          email: payload_email,
          hasLoaded: hasLoaded,
          school: school
        }
      }
    case 'SET_SCHOOL_COLOR_PALLETE':
      return {
        ...state, 
        schoolColorPallete: {
          colorToggled: colorToggled,
        }
      }
    case 'SET_DARK_MODE':
      return {
        ...state,
        darkMode: {
          toggled: toggled,
        }
      }
    case 'SET_NOTIIFICATION_COUNT':
      return {
        ...state,
        count: {
          notificationCount: notificationCount,
        }
      }
    case 'SET_NOTIF' :
      return {
        ...state,
        notifSet: {
          set: notifSet
        }
      }
    case 'SET_MINIMAL' :
      return {
        ...state,
        minimal : {
          isMinimal : minimal
        }
      }

  }

  return state;
}