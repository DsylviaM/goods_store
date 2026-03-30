import React, { useState, useEffect, useMemo } from 'react';
import styles from './ProductTable.module.css';
import AddProductModal from '../AddProductModal/AddProductModal';
import Toast from '../Toast/Toast';
import type { AddProductRequest } from '../../types';
import botton_bl from '../../assets/images/botton_bl.svg';

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  rating: number;
  price: number;
  discountPercentage?: number;
  stock: number;
  thumbnail: string;
  images?: string[];
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

const ProductsTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortField, setSortField] = useState<'title' | 'brand' | 'price' | 'rating'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const itemsPerPage = 10;

  // Загрузка товаров с API (с поддержкой поиска и пагинации)
  const fetchProducts = async (search?: string, page?: number) => {
    setLoading(true);
    setError(null);

    const currentPageNum = page || currentPage;
    const skip = (currentPageNum - 1) * itemsPerPage;

    try {
      let url = '';

      if (search && search.trim()) {
        // Поиск через API
        url = `https://dummyjson.com/products/search?q=${encodeURIComponent(search)}&limit=${itemsPerPage}&skip=${skip}`;
      } else {
        // Получение всех товаров с пагинацией
        url = `https://dummyjson.com/products?limit=${itemsPerPage}&skip=${skip}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке товаров');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Поиск с debounce (задержка, чтобы не отправлять запрос на каждый символ)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1); // Сбрасываем на первую страницу
        fetchProducts(searchQuery, 1);
      }
    }, 500); // Ждем 500мс после последнего ввода

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Загрузка при изменении страницы
  useEffect(() => {
    if (currentPage > 1 || searchQuery) {
      fetchProducts(searchQuery, currentPage);
    }
  }, [currentPage]);

  // Начальная загрузка
  useEffect(() => {
    fetchProducts();
  }, []);

  // Сортировка (клиентская, так как API не поддерживает сортировку)
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'price' || sortField === 'rating') {
        aValue = aValue as number;
        bValue = bValue as number;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [products, sortField, sortOrder]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchProducts();
  };

  const handleAddProduct = async (newProduct: AddProductRequest) => {
    try {
      // Локальное добавление (без API)
      const newProductWithId: Product = {
        id: Date.now(),
        title: newProduct.title,
        price: newProduct.price,
        brand: newProduct.brand,
        sku: newProduct.sku,
        category: 'Новые товары',
        stock: 0,
        rating: 0,
        description: '',
        thumbnail: '',
        images: [],
        discountPercentage: 0
      };

      setProducts(prev => [newProductWithId, ...prev]);
      setTotalProducts(prev => prev + 1);

      setToast({
        message: `Товар "${newProduct.title}" успешно добавлен!`,
        type: 'success'
      });

      setIsModalOpen(false);
    } catch (err) {
      setToast({
        message: 'Ошибка при добавлении товара',
        type: 'error'
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === sortedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(sortedProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (id: number) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(p => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  if (loading && products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.allProductsCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Загрузка товаров...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Навигационная панель */}
        <div className={styles.navbar}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Товары</h1>
          </div>

          <div className={styles.menu}>
            {/* Поиск */}
            <div className={styles.search}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#999999" strokeWidth="2" />
                <path d="M16 16L21 21" stroke="#999999" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Найти..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Блок "Все товары" */}
        <div className={styles.allProductsCard}>
          {/* Заголовок с кнопками */}
          <div className={styles.cardHeader}>
            <h2 className={styles.allProductsTitle}>
              {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Все позиции'}
            </h2>
            <div className={styles.cardActions}>
              <button className={styles.refreshButton} onClick={handleRefresh}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4" stroke="#515161" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 4H20V8" stroke="#515161" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Добавить товар</span>
              </button>
            </div>
          </div>

          {/* Таблица */}
          {error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button onClick={() => fetchProducts(searchQuery, currentPage)} className={styles.retryButton}>
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <div className={styles.table}>
                {/* Заголовки колонок */}
                <div className={styles.tableHeader}>
                  <div className={styles.headerProduct}>
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                        onChange={handleSelectAll}
                        className={styles.checkbox}
                      />
                    </div>
                    <span
                      onClick={() => handleSort('title')}
                      className={styles.sortable}
                    >
                      Наименование {getSortIcon('title')}
                    </span>
                  </div>
                  <div className={styles.headerDetails}>
                    <span
                      onClick={() => handleSort('brand')}
                      className={styles.sortable}
                    >
                      Вендор {getSortIcon('brand')}
                    </span>
                    <span>Артикул</span>
                    <span
                      onClick={() => handleSort('rating')}
                      className={styles.sortable}
                    >
                      Оценка {getSortIcon('rating')}
                    </span>
                    <span
                      onClick={() => handleSort('price')}
                      className={styles.sortable}
                    >
                      Цена, ₽ {getSortIcon('price')}
                    </span>
                    <span>Наличие</span>
                    <span></span>
                  </div>
                </div>

                {/* Строки товаров */}
                {sortedProducts.map((product) => (
                  <div key={product.id} className={styles.tableRow}>
                    <div className={styles.rowProduct}>
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className={styles.checkbox}
                        />
                      </div>
                      <div className={styles.productImage}>
                        {product.thumbnail && (
                          <img src={product.thumbnail} alt={product.title} />
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.title}</span>
                        <span className={styles.productCategory}>{product.category}</span>
                      </div>
                    </div>
                    <div className={styles.rowDetails}>
                      <span>{product.brand || '—'}</span>
                      <span>{product.sku || '—'}</span>
                      <span className={product.rating < 4 ? styles.lowRating : ''}>
                        {product.rating}/5
                      </span>
                      <span className={styles.price}>{formatPrice(product.price)}</span>
                      <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                        {product.stock > 0 ? `${product.stock} шт` : 'Нет в наличии'}
                      </span>
                      <div className={styles.rowActions}>
                        <button className={styles.editButton}>
                          <img src={botton_bl} alt="..." />
                        </button>
                        <button className={styles.moreButton}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#B2B3B9" strokeWidth="1.5" fill="white" />
                            <circle cx="12" cy="12" r="1.5" fill="#B2B3B9" />
                            <circle cx="17" cy="12" r="1.5" fill="#B2B3B9" />
                            <circle cx="7" cy="12" r="1.5" fill="#B2B3B9" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedProducts.length === 0 && !loading && (
                  <div className={styles.emptyContainer}>
                    <p>Товары не найдены</p>
                  </div>
                )}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    Показано {products.length} из {totalProducts} товаров
                  </span>
                  <div className={styles.paginationControls}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={styles.paginationArrow}
                    >
                      ←
                    </button>
                    <div className={styles.pageNumbers}>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum = currentPage;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={styles.paginationArrow}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Модальное окно добавления товара */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* Toast уведомление */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductsTable;