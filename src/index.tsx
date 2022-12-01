import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { TabsContextProvider } from "./my-context";
import reducer from "./redux/reducer";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const store = createStore(reducer);
window.screen.orientation.lock("portrait");
ReactDOM.render(
  <Provider store={store}>
    <TabsContextProvider>
      <App />
    </TabsContextProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();
