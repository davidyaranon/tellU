import { App, URLOpenListenerEvent } from "@capacitor/app";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import auth from "./fbConfig";

const AppUrlListener: React.FC<any> = () => {

  const [user, loading, error] = useAuthState(auth);
  const history = useHistory();

  useEffect(() => {
    if (!loading) {
      if (user) {
        App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
          const domain = 'quantum-61b84.firebaseapp.com'
          const slug = event.url.split(domain);
          const path = slug.pop();
          if (user && path && (path.includes('post/') || path.includes('about/'))) {
            console.log('setting path to ' + path);
            history.push(path);
          }
        });
      }
    }
  }, [loading, user]);

  return null;
};

export default AppUrlListener;