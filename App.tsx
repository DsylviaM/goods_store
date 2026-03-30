import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styles from './App.module.css';
import AuthForm from './src/components/AuthForm/AuthForm';
import ProductTable from './src/components/ProductTable/ProductTable';
import AddProductModal from './src/components/AddProductModal/AddProductModal';
import Toast from './src/components/Toast/Toast';
import { getProducts, addProduct as apiAddProduct } from './src/api/products';
import { Product, SortField, SortOrder, AddProductRequest } from './src/types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Добавляем ref, чтобы отслеживать, был ли уже начальный рендер
  const initialLoadDone = useRef(false);

  // loadProducts - не зависит от внешних переменных
  const loadProducts = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const response = await getProducts(30, 0, search);
      setProducts(response.products);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setToast({ message: 'Ошибка загрузки товаров', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []); // Пустой массив - функция стабильна

  // Исправленный useEffect - проверяем токен и загружаем данные только один раз
  useEffect(() => {
    const token = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    
    if ((token || sessionToken) && !initialLoadDone.current) {
      setIsAuthenticated(true);
      loadProducts();
      initialLoadDone.current = true;
    }
  }, [loadProducts]); // Теперь loadProducts не меняется, useEffect сработает только раз

  const handleLoginSuccess = (token: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    setIsAuthenticated(true);
    loadProducts();
    initialLoadDone.current = true;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
    setProducts([]);
    initialLoadDone.current = false;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(searchQuery);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Используем useEffect для загрузки при изменении searchQuery
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  //useEffect - загружает товары когда меняется searchQuery
  useEffect(() => {
    if (isAuthenticated) {
      loadProducts(searchQuery);
    }
  }, [searchQuery, isAuthenticated, loadProducts]);

  const handleAddProduct = async (product: AddProductRequest) => {
    try {
      const newProduct = await apiAddProduct(product);
      setProducts(prev => [newProduct, ...prev]);
      setToast({ message: 'Товар успешно добавлен', type: 'success' });
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      setToast({ message: 'Ошибка добавления товара', type: 'error' });
    }
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'price' || sortField === 'rating') {
        aValue = aValue as number;
        bValue = bValue as number;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [products, sortField, sortOrder]);

  if (!isAuthenticated) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Управление товарами для тестового задания</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </header>
      
      <main className={styles.main}>       
        <ProductTable />
      </main>
      
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProduct}
      />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;