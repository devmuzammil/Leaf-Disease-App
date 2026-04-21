import React from "react";
import { Provider } from "react-redux";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { store } from "./src/store";
import { PreferencesHydrator } from "./src/components/PreferencesHydrator";

export default function App() {
  return (
    <Provider store={store}>
      <PreferencesHydrator>
        <RootNavigator />
      </PreferencesHydrator>
    </Provider>
  );
}
