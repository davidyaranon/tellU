import { useHistory } from "react-router";
import React, { useEffect } from 'react'

function RedirectComponent() {
    const history = useHistory();
    useEffect(() => {
        history.go(-1);
    }, []);

    return ( null );
}

export default React.memo(RedirectComponent);