import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingListDto } from '@/types';

interface ShoppingListsState {
  lists: ShoppingListDto[];
  selectedList: ShoppingListDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShoppingListsState = {
  lists: [],
  selectedList: null,
  loading: false,
  error: null,
};

const shoppingListsSlice = createSlice({
  name: 'shoppingLists',
  initialState,
  reducers: {
    setLists: (state, action: PayloadAction<ShoppingListDto[]>) => {
      state.lists = action.payload;
    },
    setSelectedList: (state, action: PayloadAction<ShoppingListDto | null>) => {
      state.selectedList = action.payload;
    },
    addList: (state, action: PayloadAction<ShoppingListDto>) => {
      state.lists.push(action.payload);
    },
    updateList: (state, action: PayloadAction<ShoppingListDto>) => {
      const index = state.lists.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = action.payload;
      }
      if (state.selectedList?.id === action.payload.id) {
        state.selectedList = action.payload;
      }
    },
    removeList: (state, action: PayloadAction<string>) => {
      state.lists = state.lists.filter(l => l.id !== action.payload);
      if (state.selectedList?.id === action.payload) {
        state.selectedList = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLists,
  setSelectedList,
  addList,
  updateList,
  removeList,
  setLoading,
  setError,
} = shoppingListsSlice.actions;

export default shoppingListsSlice.reducer;
