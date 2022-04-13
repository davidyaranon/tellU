import { toggleSharp } from "ionicons/icons";

const defaultState = {
    user: {},
    email: {},
    hasLoaded: {},
    toggled: {}
}


export default function reducer( state = defaultState, { type, payload_username, payload_email, hasLoaded, toggled } : { type: string, payload_username: any, payload_email: any , hasLoaded: boolean, toggled : boolean}) : any {
    switch(type) {
        case 'SET_USER_STATE':
            return {
                ...state,
                user: {
                    username: payload_username,
                    email: payload_email,
                    hasLoaded: hasLoaded
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