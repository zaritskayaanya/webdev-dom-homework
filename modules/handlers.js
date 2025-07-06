import { commentsData } from './commentsData.js';
import { renderComments } from './commentsRenderer.js';
import { sanitizeInput } from './utils.js';

export function initialize() {
  const commentsEl = document.querySelector('.comments');
  const addNameEl = document.querySelector('.add-form-name');
  const addTextEl = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');
  const loadingScreen = document.getElementById('loading-screen');
  const commentLoadingEl = document.querySelector('.comment-loading');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const loginModal = document.getElementById('login-modal');
  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');
  const authLink = document.getElementById('auth-link');
  const registerScreen = document.getElementById('register-screen');

  // Переменная авторизации
  let isAuth = false;

  // Инициализация
  checkAuth().then((authStatus) => {
    isAuth = authStatus;
    updateUI();
    loadComments();
    fillAuthorField();
  });

  // Обработчики
  addButton.onclick = () => sendComment();

  document.getElementById('btn-login').onclick = () => {
    loginModal.style.display = 'flex';
  };

  document.getElementById('login-submit').onclick = () => {
    loginUser();
  };

  btnLogout.onclick = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    isAuth = false; // Обновляем переменную
    updateUI();
  };

  document.getElementById('auth-link').onclick = (e) => {
    e.preventDefault();
    document.getElementById('register-screen').style.display = 'flex';
  };

  document.getElementById('register-submit').onclick = () => {
    registerUser();
  };

  document.getElementById('close-register').onclick = () => {
    document.getElementById('register-screen').style.display = 'none';
  };

  document.getElementById('close-login').onclick = () => {
    loginModal.style.display = 'none';
  };

  // Вход по клику вне модальных окон
  document.getElementById('login-modal').onclick = (e) => {
    if (e.target === document.getElementById('login-modal')) {
      loginModal.style.display = 'none';
    }
  };

  // Загрузка комментариев при старте
  window.onload = () => {
    updateUI();
    loadComments();
    fillAuthorField();
  };

  // Проверка авторизации
  async function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    try {
      const res = await fetch('https://wedev-api.sky.pro/api/user', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) return true;
      else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        return false;
      }
    } catch {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      return false;
    }
  }

  function updateUI() {
    const addForm = document.querySelector('.add-form');
    if (isAuth) {
      addForm.style.display = 'flex';
      document.querySelector('#auth-link').style.display = 'none';
      document.getElementById('btn-login').style.display = 'none';
      document.getElementById('btn-logout').style.display = 'inline-block';
    } else {
      addForm.style.display = 'none';
      document.querySelector('#auth-link').style.display = 'block';
      document.getElementById('btn-login').style.display = 'inline-block';
      document.getElementById('btn-logout').style.display = 'none';
    }
  }

  function fillAuthorField() {
    const authorField = document.querySelector('.add-form-name');
    if (!authorField) return;
    authorField.setAttribute('readonly', 'readonly');
    if (isAuth) {
      const login = localStorage.getItem('userName') || 'Аноним';
      authorField.value = login;
    } else {
      authorField.value = '';
    }
  }

  async function loadComments() {
    loadingScreen.style.display = 'flex';
    try {
      const res = await fetch('https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments');
      if (!res.ok) {
        if (res.status === 500) alert('Ошибка сервера при загрузке комментариев.');
        else alert(`Ошибка при загрузке комментариев: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      commentsData.length = 0;
      commentsData.push(...data.comments);
      renderComments(commentsData, document.querySelector('.comments'));
      addHandlers();
    } catch (err) {
      console.error(err);
    } finally {
      loadingScreen.style.display = 'none';
    }
  }

  function addHandlers() {
    addQuoteHandlers();
    addLikeHandlers();
  }

  function addQuoteHandlers() {
    document.querySelectorAll('.comment').forEach((elem, index) => {
      elem.onclick = () => {
        const comment = commentsData[index];
        const quoteText = `> ${sanitizeInput(comment.text)}\n`;
        addNameEl.value = sanitizeInput(comment.author.name);
        addTextEl.value = quoteText;
      };
    });
  }

  function addLikeHandlers() {
    document.querySelectorAll('.like-button').forEach((btn, index) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        toggleLike(index);
      };
    });
  }

  function toggleLike(index) {
    if (!isAuth) {
      alert('Пожалуйста, войдите, чтобы ставить лайки.');
      return;
    }
    const comment = commentsData[index];
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    renderComments(commentsData, document.querySelector('.comments'));
    addHandlers();
  }

  async function sendComment() {
    if (!isAuth) {
      alert('Пожалуйста, войдите, чтобы оставить комментарий.');
      return;
    }
    if (commentLoadingEl) commentLoadingEl.style.display = 'flex';
    document.querySelector('.add-form-button').disabled = true;
    const name = document.querySelector('.add-form-name').value.trim();
    const text = document.querySelector('.add-form-text').value.trim();
    if (!name || !text) {
      alert('Заполните все поля');
      document.querySelector('.add-form-button').disabled = false;
      if (commentLoadingEl) {
        commentLoadingEl.style.display = 'none';
      }
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments', {
        method: 'POST',
        body: JSON.stringify({ name, text }),
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Ошибка при отправке комментария: ${res.status} - ${errorData.message}`);
        throw new Error(`HTTP ${res.status}`);
      }
      await loadComments();
      document.querySelector('.add-form-text').value = '';
    } catch (err) {
      console.error(err);
    } finally {
      document.querySelector('.add-form-button').disabled = false;
      if (commentLoadingEl) commentLoadingEl.style.display = 'none';
    }
  }

  // Вход пользователя
  async function loginUser() {
    const login = document.getElementById('login-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    try {
      const res = await fetch('https://wedev-api.sky.pro/api/user/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      });
      if (res.status === 201) {
        const data = await res.json();
        localStorage.setItem('authToken', data.user.token);
        localStorage.setItem('userName', data.user.login);
        // Обновляем переменную авторизации
        isAuth = true;
        // Обновляем интерфейс
        updateUI();
        fillAuthorField();
        document.getElementById('login-modal').style.display = 'none';
      } else if (res.status === 400) {
        const data = await res.json();
        alert(`Ошибка входа: ${data.message || 'Неверный логин или пароль'}`);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Регистрация
  async function registerUser() {
    const login = document.getElementById('register-login').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const name = prompt('Введите ваше имя для регистрации');
    if (!login || !password || !name) {
      alert('Заполните все поля');
      return;
    }
    try {
      const res = await fetch('https://wedev-api.sky.pro/api/user', {
        method: 'POST',
        body: JSON.stringify({ login, name, password }),
      });
      if (res.status === 201) {
        const data = await res.json();
        localStorage.setItem('authToken', data.user.token);
        localStorage.setItem('userName', data.user.name);
        // Обновляем переменную авторизации
        isAuth = true;
        updateUI();
        fillAuthorField();
        document.getElementById('register-screen').style.display = 'none';
      } else if (res.status === 400) {
        const data = await res.json();
        if (data.error && data.error.includes('уже существует')) {
          alert('Этот логин уже занят. Попробуйте другой.');
        } else {
          alert(`Ошибка регистрации: ${data.error || 'Неизвестная ошибка'}`);
        }
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
}