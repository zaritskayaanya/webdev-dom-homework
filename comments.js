"use strict";

const API_URL = "https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments";

const addFormButton = document.querySelector('.add-form-button');
const addFormNameInput = document.querySelector('.add-form-name');
const addFormTextInput = document.querySelector('.add-form-text');
const commentsList = document.querySelector('.comments');
const commentLoadingDiv = document.getElementById('comment-loading');
const loadingScreen = document.getElementById('loading-screen');

let formData = {
  name: '',
  text: ''
};

// Обновляем переменные при вводе
addFormNameInput.addEventListener('input', () => {
  formData.name = addFormNameInput.value;
});
addFormTextInput.addEventListener('input', () => {
  formData.text = addFormTextInput.value;
});

// Показываем/скрываем лоадер загрузки комментариев
window.addEventListener('load', () => {
  loadingScreen.style.display = 'flex';
  loadComments().then(() => {
    loadingScreen.style.display = 'none';
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

// Безопасная обработка
function sanitizeInput(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

let commentsData = [];

// Загрузка комментариев
function fetchComments() {
  return fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        if (response.status === 500) {
          alert('Ошибка сервера при загрузке комментариев. Попробуйте позже.');
        } else {
          alert(`Ошибка при загрузке комментариев: ${response.status}`);
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      commentsData = data.comments;
      renderComments();
    })
    .catch(error => {
      if (error.message.includes('Failed to fetch')) {
        alert('Проблемы с соединением: проверьте интернет');
      } else {
        console.error('Ошибка:', error);
      }
    });
}

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

// Обработка цитаты
function addQuoteOnCommentClick() {
  document.querySelectorAll('.comment').forEach((commentElem, index) => {
    // Обновляем обработчик
    commentElem.replaceWith(commentElem.cloneNode(true));
    commentElem = document.querySelectorAll('.comment')[index];

    commentElem.addEventListener('click', () => {
      const comment = commentsData[index];
      const sanitizedText = sanitizeInput(comment.text);
      const sanitizedName = sanitizeInput(comment.author.name);
      const quoteText = `> ${sanitizedText}\n`;
      addFormNameInput.value = sanitizedName;
      addFormTextInput.value = quoteText;
      // Обновляем переменные
      formData.name = sanitizedName;
      formData.text = quoteText;
    });
  });
}

// Обработка лайков
function addLikeButtonHandlers() {
  document.querySelectorAll('.like-button').forEach((button, idx) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleLike(idx);
    });
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
  // Блокируем кнопку
  addFormButton.disabled = true;
  showCommentLoading();

  // Вставляем текущие данные из переменной
  addFormNameInput.value = formData.name;
  addFormTextInput.value = formData.text;

  const name = formData.name.trim();
  const text = formData.text.trim();

  if (name === "" || text === "") {
    alert("Пожалуйста, заполните все поля!");
    addFormButton.disabled = false;
    hideCommentLoading();
    return;
  }

  const payload = {
    name,
    text,
    forceError: false 
  };

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
     // 'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      if (response.status === 400) {
        alert('Ошибка: неверные данные при добавлении комментария');
      } else if (response.status === 500) {
        alert('Ошибка сервера при добавлении комментария. Попробуйте позже.');
      } else {
        alert(`Произошла ошибка: ${response.status}`);
      }
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(() => {
    return fetchComments();
  })
  .then(() => {
    
  })
  .catch(error => {
    if (error.message.includes('Failed to fetch')) {
      alert('Проблемы с соединением: проверьте интернет');
    } else {
      console.error('Ошибка:', error);
    }
  })
  .finally(() => {
    hideCommentLoading();
    addFormButton.disabled = false;
  });
}

// Обработчик кнопки
addFormButton.addEventListener("click", () => {
  sendComment();
});

