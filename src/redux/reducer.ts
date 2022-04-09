const defaultState = {
    user: {},
    email: {},
    hasLoaded: {}
}


export default function reducer( state = defaultState, { type, payload_username, payload_email, hasLoaded } : { type: string, payload_username: any, payload_email: any , hasLoaded: boolean}) : any {
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
    }

    return state;
}