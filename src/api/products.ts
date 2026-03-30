import type { Product, ProductsResponse, AddProductRequest } from '../types';

const BASE_URL = 'https://dummyjson.com';

export const getProducts = async (
  limit: number = 30,
  skip: number = 0,
  search?: string
): Promise<ProductsResponse> => {
  let url = `${BASE_URL}/products?limit=${limit}&skip=${skip}`;
  
  if (search) {
    url = `${BASE_URL}/products/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Ошибка загрузки товаров');
  }
  
  return response.json();
};

export const addProduct = async (product: AddProductRequest): Promise<Product> => {
  const response = await fetch(`${BASE_URL}/products/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка добавления товара');
  }
  
  return response.json();
};