export interface Product {
  id: number;
  title: string;
  price: number;
  brand: string;
  sku: string;
  rating: number;
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

export interface AddProductRequest {
  title: string;
  price: number;
  brand: string;
  sku: string;
}

export type SortField = 'title' | 'price' | 'rating';
export type SortOrder = 'asc' | 'desc';