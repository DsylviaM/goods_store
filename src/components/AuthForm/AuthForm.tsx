import React, { useState, useEffect } from 'react';
import styles from './AuthForm.module.css';
import logo from '../../assets/images/logo.svg';
import { login } from '../../api/auth';

// SVG иконки
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="#C9C9C9" strokeWidth="2" />
    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="#C9C9C9" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="11" rx="2" stroke="#C9C9C9" strokeWidth="2" />
    <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="#C9C9C9" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="#C9C9C9" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="#C9C9C9" strokeWidth="2" />
  </svg>
);


interface AuthFormProps {
  onLoginSuccess: (token: string, remember: boolean) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Добавляем состояние для показа пароля
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // При монтировании проверяем наличие сохраненных данных
  useEffect(() => {
    // Проверяем localStorage (постоянное хранилище)
    const savedUsername = localStorage.getItem('saved_username');
    const savedRemember = localStorage.getItem('remember_me') === 'true';

    if (savedUsername && savedRemember) {
      setUsername(savedUsername);
      setRemember(true);
    }

    // Проверяем sessionStorage (временное хранилище)
    const sessionUsername = sessionStorage.getItem('session_username');
    if (sessionUsername && !savedRemember) {
      setUsername(sessionUsername);
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Введите логин';
    }

    if (!password.trim()) {
      newErrors.password = 'Введите пароль';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await login({ username, password });

      // Сохраняем токен в зависимости от чекбокса
      if (remember) {
        // Постоянное хранение - живет после закрытия браузера
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('saved_username', username);

        // Очищаем sessionStorage если там что-то было
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('session_username');
      } else {
        // Временное хранение - сбрасывается при закрытии вкладки
        sessionStorage.setItem('auth_token', response.token);
        sessionStorage.setItem('session_username', username);

        // Очищаем localStorage если там что-то было
        localStorage.removeItem('auth_token');
        localStorage.removeItem('remember_me');
        localStorage.removeItem('saved_username');
      }
      onLoginSuccess(response.token, remember);
    } catch (error) {
      // Обработка разных типов ошибок от API
      if (error instanceof Error) {
        // Если ошибка содержит информацию о поле
        if (error.message.includes('username')) {
          setErrors({ username: error.message });
        } else if (error.message.includes('password')) {
          setErrors({ password: error.message });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: 'Ошибка авторизации. Попробуйте позже.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для очистки ошибки конкретного поля при вводе
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  // Обработчик для ссылки "Создать" - ничего не делает
  const handleCreateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Ссылка никуда не ведёт
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formInner}>
          {/* Логотип */}
          <div className={styles.logo}>
            <img src={logo} alt="Логотип" />
          </div>

          {/* Текстовый блок с заголовками */}
          <div className={styles.textBlock}>
            <h1 className={styles.title}>Авторизация</h1>
            <p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.fieldsContainer}>
              {/* Поле Логин */}
              <div className={styles.inputGroup}>
                <label>Логин</label>
                <div className={`${styles.inputWrapper} ${errors.username ? styles.inputError : ''}`}>
                  <div className={styles.icon}>
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="emilys"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <span className={styles.errorText}>{errors.username}</span>
                )}
              </div>

              {/* Поле Пароль */}
              <div className={styles.inputGroup}>
                <label>Пароль</label>
                <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''}`}>
                  <div className={styles.icon}>
                    <LockIcon />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="•••••••••••••"
                    disabled={loading}
                  />
                  <div
                    className={styles.icon}
                    onClick={() => !loading && setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  >
                    <EyeIcon />
                  </div>
                </div>
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              {/* Чекбокс */}
              <div
                className={styles.checkboxGroup}
                onClick={() => !loading && setRemember(!remember)}
              >
                <div className={`${styles.customCheckbox} ${remember ? styles.checked : ''}`} />
                <label>Запомнить данные</label>
              </div>
            </div>

            <div className={styles.actionsContainer}>
              {errors.general && (
                <div className={styles.generalError} role="alert">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>

              {/* Разделитель "или" */}
              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>или</span>
                <div className={styles.dividerLine} />
              </div>
            </div>
          </form>

          {/* Ссылка регистрации */}
          <div className={styles.registerLink}>
            Нет аккаунта?{' '}
            <a
              href="#"
              onClick={handleCreateClick}
              className={styles.createLink}
            >
              Создать
            </a>
          </div>

          {/* Подсказка */}
          <div className={styles.hint}>
            Тестовые данные: <strong>emilys</strong> / <strong>emilyspass</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
