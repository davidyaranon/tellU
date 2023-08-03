import { App, URLOpenListenerEvent } from "@capacitor/app";
import { GetResult, Preferences } from "@capacitor/preferences";
import { useCallback, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import auth from "./fbConfig";
import { useToast } from "@agney/ir-toast";
import { timeout } from "./helpers/timeout";
import { useContext } from "./my-context";

const AppUrlListener: React.FC<any> = () => {

  const [user, loading, error] = useAuthState(auth);
  const context = useContext();
  const history = useHistory();
  const Toast = useToast();

  /**
   * @description checks to see if the user is authenticated.
   * If so, appUrlOpen listener is added to handle deep link re-routing.
   * This re-routing will only occur if the user is authenticated and the url contains the user's school.
   */
  const checkPermissions = useCallback(async () => {
    const schoolName: GetResult = await Preferences.get({ key: "school" });
    if (user && schoolName && schoolName.value) {
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        const domain: string = 'quantum-61b84.firebaseapp.com'
        const slug: string[] = event.url.split(domain);
        const path: string | undefined = slug.pop();
        if (user && path) {
          const decodedPath: string = decodeURIComponent(path);
          if (decodedPath.includes('post/') || decodedPath.includes('about/')) {
            if (schoolName && schoolName.value && decodedPath.includes(schoolName.value)) {
              console.log('setting path to ' + decodedPath);
              history.push(decodedPath);
            } else {
              const toast = Toast.create({ message: 'Post is from another school!', duration: 2000, color: 'toast-error' });
              toast.present();
            }
          } else {
            const toast = Toast.create({ message: 'Invalid URL', duration: 2000, color: 'toast-error' });
            toast.present();
          }
        }
      });
    }
  }, [user]);

  /**
   * @description runs on app load. If the user is logged in, check to see if url listener can be added
   */
  useEffect(() => {
    if (!loading && context.initLoad) {
      checkPermissions();
    }
  }, [loading, checkPermissions, context.setInitLoad, context.initLoad]);

  return null;
};

export default AppUrlListener;