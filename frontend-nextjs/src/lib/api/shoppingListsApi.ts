import { apiClient } from './client';
import {
  ShoppingListDto,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  CreateShoppingItemRequest,
  UpdateShoppingItemRequest,
  MarkItemPurchasedRequest,
  ShoppingItemDto,
} from '@/types';

export const shoppingListsApi = {
  // Shopping Lists
  getAllLists: async (): Promise<ShoppingListDto[]> => {
    const response = await apiClient.get<ShoppingListDto[]>('/ShoppingLists');
    return response.data;
  },

  getListById: async (id: string): Promise<ShoppingListDto> => {
    const response = await apiClient.get<ShoppingListDto>(`/ShoppingLists/${id}`);
    return response.data;
  },

  createList: async (data: CreateShoppingListRequest): Promise<ShoppingListDto> => {
    const response = await apiClient.post<ShoppingListDto>('/ShoppingLists', data);
    return response.data;
  },

  updateList: async (id: string, data: UpdateShoppingListRequest): Promise<ShoppingListDto> => {
    const response = await apiClient.put<ShoppingListDto>(`/ShoppingLists/${id}`, data);
    return response.data;
  },

  deleteList: async (id: string): Promise<void> => {
    await apiClient.delete(`/ShoppingLists/${id}`);
  },

  // Shopping Items
  createItem: async (listId: string, data: CreateShoppingItemRequest): Promise<ShoppingItemDto> => {
    const response = await apiClient.post<ShoppingItemDto>(`/ShoppingLists/${listId}/items`, data);
    return response.data;
  },

  updateItem: async (listId: string, itemId: string, data: UpdateShoppingItemRequest): Promise<ShoppingItemDto> => {
    const response = await apiClient.put<ShoppingItemDto>(`/ShoppingLists/${listId}/items/${itemId}`, data);
    return response.data;
  },

  deleteItem: async (listId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/ShoppingLists/${listId}/items/${itemId}`);
  },

  markItemPurchased: async (listId: string, itemId: string, data: MarkItemPurchasedRequest): Promise<ShoppingItemDto> => {
    const response = await apiClient.post<ShoppingItemDto>(`/ShoppingLists/${listId}/items/${itemId}/purchase`, data);
    return response.data;
  },
};
