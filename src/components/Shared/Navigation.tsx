/**
 * Provides navigation/history logic for app (going back/pushing forward)
 */

import { RouterDirection, UseIonRouterResult } from "@ionic/react";

export const dynamicNavigate = (router : UseIonRouterResult, path: string, direction: RouterDirection) => {
  const action = direction === "forward" ? "push" : "pop";
  router.push(path, direction, action);
}
export const navigateBack = (router : UseIonRouterResult) => {
  if (router.canGoBack()) {
    router.goBack();
  } else {
    dynamicNavigate(router, '/home', 'back');
  }
}