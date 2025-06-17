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

let commentsData = [];
let isAuth = false;

// Проверка статуса авторизации
function checkAuth() {
  return !!localStorage.getItem('authToken');
}

// Обновление UI в зависимости от статуса
function updateUI() {
  isAuth = checkAuth();
  if (isAuth) {
    addButton.disabled = false;
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'inline-block';
  } else {
    addButton.disabled = true;
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
    const likeClass = comment.isLiked ? 'like-active' : '';
    commentsEl.innerHTML += `
      <li class="comment" data-index="${index}" style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:5px;">
          <div>${sanitizeInput(comment.author.name)}</div>
          <div>${formattedDate}</div>
        </div>
        <div style="margin-bottom:5px;">${sanitizeInput(comment.text)}</div>
        <div style="display:flex; align-items:center;">
          <button class="like-button ${likeClass}" style="border:none; background:none; cursor:pointer; margin-right:8px;">👍</button>
          <span class="likes-count">${comment.likes}</span>
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
  document.getElementById('comment-loading').style.display = 'flex';

  const name = addNameEl.value.trim();
  const text = addTextEl.value.trim();

  if (!name || !text) {
    alert('Заполните все поля');
    addButton.disabled = false;
    document.getElementById('comment-loading').style.display = 'none';
    return;
  }

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ name, text, forceError: false }),
    headers: {
    //  'Content-Type': 'application/json',
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
    document.getElementById('comment-loading').style.display = 'none';
  });
}

// Обработчики кнопок
addButton.onclick = () => {
  sendComment();
};

document.getElementById('btn-login').onclick = () => {
  loginModal.style.display = 'flex';
};

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

document.getElementById('btn-logout').onclick = () => {
  localStorage.removeItem('authToken');
  updateUI();
};

// Обработка закрытия модального окна
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


