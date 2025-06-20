"use strict";

const API_URL = "https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments";

const commentsEl = document.querySelector('.comments');
const addNameEl = document.querySelector('.add-form-name');
const addTextEl = document.querySelector('.add-form-text');
const addButton = document.querySelector('.add-form-button');

const loadingScreen = document.getElementById('loading-screen');

const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

const loginModal = document.getElementById('login-modal');
const loginInput = document.getElementById('login-input');
const passwordInput = document.getElementById('password-input');
const loginSubmitBtn = document.getElementById('login-submit');

const authLink = document.getElementById('auth-link');
const registerScreen = document.getElementById('register-screen');
const closeRegisterBtn = document.getElementById('close-register');

let commentsData = [];
let isAuth = false;

// Проверка авторизации
function checkAuth() {
  return !!localStorage.getItem('authToken');
}

// Обновление UI
function updateUI() {
  isAuth = checkAuth();
  if (isAuth) {
    addButton.disabled = false;
    document.querySelector('.add-form').style.display = 'block';
    document.querySelector('#auth-link').style.display = 'none';
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'inline-block';
  } else {
    addButton.disabled = true;
    document.querySelector('.add-form').style.display = 'none';
    document.querySelector('#auth-link').style.display = 'block';
    btnLogin.style.display = 'inline-block';
    btnLogout.style.display = 'none';
  }
}

// Загрузка комментариев
function loadComments() {
  loadingScreen.style.display = 'flex';
  fetch(API_URL)
    .then(res => {
      if (!res.ok) {
        if (res.status === 500) alert('Ошибка сервера при загрузке комментариев.');
        else alert(`Ошибка при загрузке комментариев: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      commentsData = data.comments;
      renderComments();
    })
    .catch(err => {
      if (err.message.includes('Failed to fetch')) alert('Проблемы с соединением.');
      else console.error(err);
    })
    .finally(() => {
      loadingScreen.style.display = 'none';
    });
}

// Отрисовка комментариев
function renderComments() {
  commentsEl.innerHTML = '';
  commentsData.forEach((comment, index) => {
    const date = new Date(comment.date);
    const formattedDate = formatDate(date);
    const likeClass = comment.isLiked ? '-active-like' : '';
    commentsEl.innerHTML += `
      <li class="comment" data-index="${index}">
        <div class="comment-header">
          <div>${sanitizeInput(comment.author.name)}</div>
          <div>${formattedDate}</div>
        </div>
        <div class="comment-body">
          <div class="comment-text">${sanitizeInput(comment.text)}</div>
        </div>
        <div class="comment-footer">
          <div class="likes">
            <button class="like-button ${likeClass}"></button>
            <div class="likes-counter">${comment.likes}</div>
          </div>
        </div>
      </li>
    `;
  });
  addQuoteHandlers();
  addLikeHandlers();
}

// Форматирование даты
function formatDate(date) {
  const d = String(date.getDate()).padStart(2,'0');
  const m = String(date.getMonth() + 1).padStart(2,'0');
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2,'0');
  const mm = String(date.getMinutes()).padStart(2,'0');
  return `${d}.${m}.${y} ${hh}:${mm}`;
}

// Безопасное отображение
function sanitizeInput(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Обработка цитаты
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

// Обработка лайков
function addLikeHandlers() {
  document.querySelectorAll('.like-button').forEach((btn, index) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleLike(index);
    };
  });
}

function toggleLike(index) {
  const comment = commentsData[index];
  comment.isLiked = !comment.isLiked;
  comment.likes += comment.isLiked ? 1 : -1;
  renderComments();
}

// Отправка комментария
function sendComment() {
  if (!isAuth) {
    alert('Пожалуйста, войдите, чтобы оставить комментарий.');
    return;
  }

  addButton.disabled = true;
  document.querySelector('.comment-loading').style.display = 'flex';

  const name = addNameEl.value.trim();
  const text = addTextEl.value.trim();

  if (!name || !text) {
    alert('Заполните все поля');
    addButton.disabled = false;
    document.querySelector('.comment-loading').style.display = 'none';
    return;
  }

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ name, text, forceError: false }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    }
  })
  .then(res => {
    if (!res.ok) {
      if (res.status === 400) alert('Ошибка: неверные данные');
      else if (res.status === 500) alert('Ошибка сервера');
      else alert(`Ошибка: ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(() => loadComments())
  .catch(err => {
    if (err.message.includes('Failed to fetch')) alert('Проблемы с соединением');
    else console.error(err);
  })
  .finally(() => {
    addButton.disabled = false;
    document.querySelector('.comment-loading').style.display = 'none';
  });
}

// Обработчики кнопок
addButton.onclick = () => {
  sendComment();
};

// Вход через модальное окно
document.getElementById('btn-login').onclick = () => {
  loginModal.style.display = 'flex';
};

// Войти по форме
document.getElementById('login-submit').onclick = () => {
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();

  // В реальности отправьте запрос на сервер
  // Здесь фиктивный вход
  if (login && password) {
    localStorage.setItem('authToken', 'dummy-token');
    loginModal.style.display = 'none';
    updateUI();
  } else {
    alert('Введите логин и пароль');
  }
};

// Выйти
btnLogout.onclick = () => {
  localStorage.removeItem('authToken');
  updateUI();
};

// Открытие экрана регистрации
document.getElementById('auth-link').onclick = (e) => {
  e.preventDefault();
  registerScreen.style.display = 'flex';
};

// Закрытие экрана регистрации
document.getElementById('close-register').onclick = () => {
  registerScreen.style.display = 'none';
};

// Обработка закрытия модального окна при клике вне содержимого
loginModal.onclick = (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
};

// Инициализация
window.onload = () => {
  loadComments();
  updateUI();
};


