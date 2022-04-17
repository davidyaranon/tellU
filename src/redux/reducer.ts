import { toggleSharp } from "ionicons/icons";

const defaultState = {
    user: {},
    email: {},
    hasLoaded: {},
    toggled: {},
    school: {},
}


export default function reducer( state = defaultState, { type, payload_username, payload_email, hasLoaded, toggled, school } : { type: string, payload_username: any, payload_email: any , hasLoaded: boolean, toggled : boolean, school : string}) : any {
    switch(type) {
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
                darkMode : {
                    toggled : toggled,
                }
            }
    }

    return state;
}