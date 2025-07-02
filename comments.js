"use strict";

const API_COMMENTS_URL =
  "https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments";
const API_USER_URL = "https://wedev-api.sky.pro/api/user";
const API_LOGIN_URL = "https://wedev-api.sky.pro/api/user/login";

const commentsEl = document.querySelector(".comments");
const addNameEl = document.querySelector(".add-form-name");
const addTextEl = document.querySelector(".add-form-text");
const addButton = document.querySelector(".add-form-button");
const loadingScreen = document.getElementById("loading-screen");
const commentLoadingEl = document.querySelector(".comment-loading");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const loginModal = document.getElementById("login-modal");
const loginInput = document.getElementById("login-input");
const passwordInput = document.getElementById("password-input");
const authLink = document.getElementById("auth-link");
const registerScreen = document.getElementById("register-screen");

let commentsData = [];
let isAuth = false;

// Проверка авторизации
async function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  try {
    const res = await fetch(API_USER_URL, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (res.ok) {
      return true;
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userName");
      return false;
    }
  } catch {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    return false;
  }
}

// Обновление UI
async function updateUI() {
  isAuth = await checkAuth();
  if (isAuth) {
    addButton.disabled = false;
    document.querySelector(".add-form").style.display = "flex";
    document.querySelector("#auth-link").style.display = "none";
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline-block";
    fillAuthorField();
  } else {
    addButton.disabled = true;
    document.querySelector(".add-form").style.display = "none";
    document.querySelector("#auth-link").style.display = "block";
    btnLogin.style.display = "inline-block";
    btnLogout.style.display = "none";
    addNameEl.value = "";
  }
}

// Заполняем имя автора
function fillAuthorField() {
  const authorField = document.querySelector(".add-form-name");
  if (!authorField) return;
  authorField.setAttribute("readonly", "readonly");
  if (isAuth) {
    const login = localStorage.getItem("userName") || "Аноним";
    authorField.value = login;
  } else {
    authorField.value = "";
  }
}

// Загрузка комментариев
async function loadComments() {
  loadingScreen.style.display = "flex";
  try {
    const res = await fetch(API_COMMENTS_URL);
    if (!res.ok) {
      if (res.status === 500)
        alert("Ошибка сервера при загрузке комментариев.");
      else alert(`Ошибка при загрузке комментариев: ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    commentsData = data.comments;
    renderComments();
  } catch (err) {
    console.error(err);
  } finally {
    loadingScreen.style.display = "none";
  }
}

// Отрисовка комментариев
function renderComments() {
  commentsEl.innerHTML = "";
  commentsData.forEach((comment, index) => {
    const date = new Date(comment.date);
    const formattedDate = formatDate(date);
    const likeClass = comment.isLiked ? "-active-like" : "";
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
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}.${m}.${y} ${hh}:${mm}`;
}

// Безопасное отображение
function sanitizeInput(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Обработка цитаты
function addQuoteHandlers() {
  document.querySelectorAll(".comment").forEach((elem, index) => {
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
  document.querySelectorAll(".like-button").forEach((btn, index) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleLike(index);
    };
  });
}

function toggleLike(index) {
  if (!isAuth) {
    alert("Пожалуйста, войдите, чтобы ставить лайки.");
    return;
  }
  const comment = commentsData[index];
  comment.isLiked = !comment.isLiked;
  comment.likes += comment.isLiked ? 1 : -1;
  renderComments();
}

// Отправка комментария
async function sendComment() {
  if (!isAuth) {
    alert("Пожалуйста, войдите, чтобы оставить комментарий.");
    return;
  }
  if (commentLoadingEl) {
    commentLoadingEl.style.display = "flex";
  }
  addButton.disabled = true;
  const name = addNameEl.value.trim();
  const text = addTextEl.value.trim();
  if (!name || !text) {
    alert("Заполните все поля");
    addButton.disabled = false;
    if (commentLoadingEl) {
      commentLoadingEl.style.display = "none";
    }
    return;
  }
  try {
    const token = localStorage.getItem("authToken");
    const res = await fetch(API_COMMENTS_URL, {
      method: "POST",
      body: JSON.stringify({ name, text }),
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      alert(
        `Ошибка при отправке комментария: ${res.status} - ${errorData.message}`
      );
      throw new Error(`HTTP ${res.status}`);
    }
    await loadComments();
    addTextEl.value = "";
  } catch (err) {
    console.error(err);
  } finally {
    addButton.disabled = false;
    if (commentLoadingEl) {
      commentLoadingEl.style.display = "none";
    }
  }
}

// Обработчики кнопок
addButton.onclick = () => {
  sendComment();
};

// Вход через модальное окно
document.getElementById("btn-login").onclick = () => {
  loginModal.style.display = "flex";
};

// Войти по форме
document.getElementById("login-submit").onclick = () => {
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();

  fetch(API_LOGIN_URL, {
    method: "POST",
    body: JSON.stringify({ login, password }),
  })
    .then((res) => {
      if (res.status === 201) {
        return res.json();
      } else if (res.status === 400) {
        return res.json().then((data) => {
          alert(`Ошибка входа: ${data.message || "Неверный логин или пароль"}`);
          throw new Error("Login error");
        });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    })
    .then((data) => {
      localStorage.setItem("authToken", data.user.token);
      localStorage.setItem("userName", data.user.login);
      updateUI();
      fillAuthorField();
      document.getElementById("login-modal").style.display = "none";
    })
    .catch((err) => {
      console.error(err);
    });
};

// Выйти
btnLogout.onclick = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userName");
  updateUI();
};

// Открытие экрана регистрации
document.getElementById("auth-link").onclick = (e) => {
  e.preventDefault();
  document.getElementById("register-screen").style.display = "flex";
};

// Обработка регистрации
document.getElementById("register-submit").onclick = () => {
  const login = document.getElementById("register-login").value.trim();
  const password = document.getElementById("register-password").value.trim();
  const name = prompt("Введите ваше имя для регистрации"); // или используйте отдельное поле

  if (!login || !password || !name) {
    alert("Заполните все поля");
    return;
  }

  fetch("https://wedev-api.sky.pro/api/user", {
    method: "POST",
    headers: {
    },
    body: JSON.stringify({ login, name, password }),
  })
    .then((res) => {
      if (res.status === 201) {
        return res.json();
      } else if (res.status === 400) {
        return res.json().then((data) => {
          if (data.error && data.error.includes("уже существует")) {
            alert("Этот логин уже занят. Попробуйте другой.");
          } else {
            alert(`Ошибка регистрации: ${data.error || "Неизвестная ошибка"}`);
          }
          throw new Error("Registration error");
        });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    })
    .then((data) => {
      // После успешной регистрации автоматически логинимся
      localStorage.setItem("authToken", data.user.token);
      localStorage.setItem("userName", data.user.name);
      updateUI();
      fillAuthorField();
      document.getElementById("register-screen").style.display = "none";
    })
    .catch((err) => {
      console.error(err);
    });
};

// Закрытие модальных окон
document.getElementById("close-register").onclick = () => {
  document.getElementById("register-screen").style.display = "none";
};
document.getElementById("close-login").onclick = () => {
  loginModal.style.display = "none";
};
loginModal.onclick = (e) => {
  if (e.target === loginModal) loginModal.style.display = "none";
};

// Инициализация
window.onload = () => {
  updateUI();
  loadComments();
  fillAuthorField();
};