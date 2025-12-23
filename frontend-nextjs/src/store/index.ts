import { configureStore } from '@reduxjs/toolkit';
import shoppingListsReducer from './slices/shoppingListsSlice';
import meiReducer from './slices/meiSlice';

export const store = configureStore({
  reducer: {
    shoppingLists: shoppingListsReducer,
    mei: meiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
