import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SupportedLanguage = "en" | "ur" | "ps";

type PreferencesState = {
  language: SupportedLanguage;
};

const initialState: PreferencesState = {
  language: "en",
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<SupportedLanguage>) {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = preferencesSlice.actions;
export default preferencesSlice.reducer;


