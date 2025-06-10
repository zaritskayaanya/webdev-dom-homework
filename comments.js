"use strict";

const API_URL = "https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments";

const addFormButton = document.querySelector('.add-form-button');
const addFormNameInput = document.querySelector('.add-form-name');
const addFormTextInput = document.querySelector('.add-form-text');
const commentsList = document.querySelector('.comments');
const commentLoadingDiv = document.getElementById('comment-loading');

// Изначально блокируем кнопку
addFormButton.disabled = true;

// Показываем стартовый экран загрузки
window.addEventListener('load', () => {
  document.getElementById('loading-screen').style.display = 'none';
  loadComments().then(() => {
    // Активируем кнопку после загрузки комментариев
    addFormButton.disabled = false;
  });
});

// Функции для управления индикатором отправки комментария
function showCommentLoading() {
  commentLoadingDiv.style.display = 'flex';
}

function hideCommentLoading() {
  commentLoadingDiv.style.display = 'none';
}

// Форматирование даты
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Безопасная обработка ввода
function sanitizeInput(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

let commentsData = [];

// Вынесенная функция получения комментариев
function fetchComments() {
  return fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Ошибка: ${response.status} ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      commentsData = data.comments;
      renderComments();
    })
    .catch(error => {
      console.error('Ошибка при загрузке комментариев:', error);
      alert('Не удалось загрузить комментарии');
    });
}

// Загрузка комментариев при инициализации
function loadComments() {
  return fetchComments();
}

// Отображение комментариев
function renderComments() {
  commentsList.innerHTML = '';
  commentsData.forEach((comment, index) => {
    const likeActiveClass = comment.isLiked ? "-active-like" : "";
    const dateObj = new Date(comment.date);
    const formattedDate = formatDate(dateObj);
    commentsList.innerHTML += `
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
            <span class="likes-counter">${comment.likes}</span>
            <button class="like-button ${likeActiveClass}"></button>
          </div>
        </div>
      </li>`;
  });
  addQuoteOnCommentClick();
  addLikeButtonHandlers();
}

// Добавление цитаты при клике
function addQuoteOnCommentClick() {
  document.querySelectorAll('.comment').forEach((commentElem, index) => {
    // Обновляем обработчик клика
    commentElem.replaceWith(commentElem.cloneNode(true));
    commentElem = document.querySelectorAll('.comment')[index];

    commentElem.addEventListener('click', () => {
      const comment = commentsData[index];
      const sanitizedText = sanitizeInput(comment.text);
      const sanitizedName = sanitizeInput(comment.author.name);
      const quoteText = `> ${sanitizedText}\n`;
      addFormNameInput.value = sanitizedName;
      addFormTextInput.value = quoteText;
    });
  });
}

// Обработчики лайков
function addLikeButtonHandlers() {
  document.querySelectorAll('.like-button').forEach((button, idx) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); // Предотвращаем запуск цитирования при клике на лайк
      toggleLike(idx);
    });
  });
}

// Переключение лайка
function toggleLike(index) {
  const comment = commentsData[index];
  comment.isLiked = !comment.isLiked;
  comment.likes += comment.isLiked ? 1 : -1;
  renderComments();
}

// Отправка комментария
function sendComment() {
  // Блокируем кнопку при начале отправки
  addFormButton.disabled = true;

  const nameRaw = addFormNameInput.value.trim();
  const textRaw = addFormTextInput.value.trim();

  if (nameRaw === "" || textRaw === "") {
    alert("Пожалуйста, заполните все поля!");
    addFormButton.disabled = false; // разблокируем, если есть ошибка
    return;
  }

  const name = sanitizeInput(nameRaw);
  const text = sanitizeInput(textRaw);
  const payload = { name, text };

  showCommentLoading();

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Accept': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Ошибка: ${response.status} ${text}`);
      });
    }
    return response.json();
  })
  .then(() => {
    return fetchComments();
  })
  .then(() => {
    addFormNameInput.value = "";
    addFormTextInput.value = "";
  })
  .catch(error => {
    console.error('Ошибка при отправке комментария:', error);
    alert(`Не удалось отправить комментарий: ${error.message}`);
  })
  .finally(() => {
    hideCommentLoading();
    // Разблокируем кнопку после завершения
    addFormButton.disabled = false;
  });
}

// Обработчик кнопки
addFormButton.addEventListener("click", () => {
  sendComment();
});
