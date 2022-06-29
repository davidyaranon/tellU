const defaultState = {
  user: {},
  email: {},
  hasLoaded: {},
  toggled: {},
  school: {},
  allPosts: {},
  userPostsLoaded: {},
  scrollY: {},
}


export default function reducer(state = defaultState, {
  type, payload_username, payload_email, hasLoaded, toggled, school, allPosts, userPostsLoaded, scrollY
}: {
  type: string,
  payload_username: any,
  payload_email: any,
  hasLoaded: boolean,
  toggled: boolean,
  school: string,
  allPosts: any,
  userPostsLoaded: boolean,
  scrollY: number
}
): any {
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
    case 'SET_DARK_MODE':
      return {
        ...state,
        darkMode: {
          toggled: toggled,
        }
      }
  }

  return state;
}