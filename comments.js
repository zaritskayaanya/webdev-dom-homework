"use strict";

const API_URL = "https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments";

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
    fillAuthorField();
  } else {
    addButton.disabled = true;
    document.querySelector('.add-form').style.display = 'none';
    document.querySelector('#auth-link').style.display = 'block';
    btnLogin.style.display = 'inline-block';
    btnLogout.style.display = 'none';
    addNameEl.value = '';
  }
}

// Заполняем поле автора из профиля
function fillAuthorField() {
  const authorField = document.querySelector('.add-form-name');
  if (!authorField) return;
  if (isAuth) {
    const login = localStorage.getItem('userName') || 'Аноним';
    authorField.value = login;
  } else {
    authorField.value = '';
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
  if (!isAuth) {
    alert('Пожалуйста, войдите, чтобы ставить лайки.');
    return;
  }
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

  if (commentLoadingEl) {
    commentLoadingEl.style.display = 'flex';
  }

  addButton.disabled = true;

  const name = addNameEl.value.trim();
  const text = addTextEl.value.trim();

  if (!name || !text) {
    alert('Заполните все поля');
    addButton.disabled = false;
    if (commentLoadingEl) {
      commentLoadingEl.style.display = 'none';
    }
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
      return res.text().then(text => {
        console.error('Ошибка при отправке:', res.status, text);
        alert(`Ошибка при отправке комментария: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      });
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
    if (commentLoadingEl) {
      commentLoadingEl.style.display = 'none';
    }
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
  if (login && password) {
    // В реальности — отправьте запрос и получите токен
    localStorage.setItem('authToken', 'dummy-token');
    localStorage.setItem('userName', login);
    loginModal.style.display = 'none';
    updateUI();
    fillAuthorField();
  } else {
    alert('Введите логин и пароль');
  }
};

// Выйти
btnLogout.onclick = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userName');
  updateUI();
};

// Открытие экрана регистрации
document.getElementById('auth-link').onclick = (e) => {
  e.preventDefault();
  registerScreen.style.display = 'flex';
};

// Обработка регистрации
document.getElementById('register-submit').onclick = () => {
  const login = document.getElementById('register-login').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (!login || !password) {
    alert('Пожалуйста, введите логин и пароль');
    return;
  }

  // Имитация регистрации
  localStorage.setItem('authToken', 'dummy-token');
  localStorage.setItem('userName', login);
  updateUI();
  fillAuthorField();
  document.getElementById('register-screen').style.display = 'none';
};

// Закрытие регистрации
document.getElementById('close-register').onclick = () => {
  document.getElementById('register-screen').style.display = 'none';
};

// Обработка закрытия модального окна входа
document.getElementById('close-login').onclick = () => {
  loginModal.style.display = 'none';
};

// Закрытие модальных окон при клике вне содержимого
loginModal.onclick = (e) => {
  if (e.target === loginModal) loginModal.style.display = 'none';
};

// Инициализация
window.onload = () => {
  loadComments();
  updateUI();
  fillAuthorField();
};