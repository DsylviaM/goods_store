import React, { useState } from 'react';
import styles from './AddProductModal.module.css';
import type { AddProductRequest } from '../../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: AddProductRequest) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAdd }) => {
    
  const [formData, setFormData] = useState<AddProductRequest>({
    title: '',
    price: 0,
    brand: '',
    sku: '',
  });
const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Введите наименование товара';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Введите корректную цену';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Введите вендора';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'Введите артикул';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onAdd(formData);
      setFormData({ title: '', price: 0, brand: '', sku: '' });
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Добавить товар</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">Наименование *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? styles.inputError : ''}
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="price">Цена *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className={errors.price ? styles.inputError : ''}
            />
            {errors.price && <span className={styles.errorText}>{errors.price}</span>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="brand">Вендор *</label>
            <input
              id="brand"
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className={errors.brand ? styles.inputError : ''}
            />
            {errors.brand && <span className={styles.errorText}>{errors.brand}</span>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="sku">Артикул *</label>
            <input
              id="sku"
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className={errors.sku ? styles.inputError : ''}
            />
            {errors.sku && <span className={styles.errorText}>{errors.sku}</span>}
          </div>
          
          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton}>
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;