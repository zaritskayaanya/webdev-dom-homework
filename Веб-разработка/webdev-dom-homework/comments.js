"use strict";

const API_URL = "https://wedev-api.sky.pro/api/v1/zaritskayaanya/comments";

const addFormButton = document.querySelector(".add-form-button");
const addFormNameInput = document.querySelector(".add-form-name");
const addFormTextInput = document.querySelector(".add-form-text");
const commentsList = document.querySelector(".comments");
let commentsData = [];

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

// Загрузка комментариев
async function loadComments() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        commentsData = data.comments;
        renderComments();
    } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
        alert('Не удалось загрузить комментарии');
    }
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
    document.querySelectorAll('.like-button').forEach((button, idx) => {
        button.addEventListener('click', () => toggleLike(idx));
    });
}

// Добавление цитаты при клике
function addQuoteOnCommentClick() {
    document.querySelectorAll('.comment').forEach((commentElem, index) => {
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

// Переключение лайка
function toggleLike(index) {
    const comment = commentsData[index];
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    renderComments();
}

// Отправка комментария
async function sendComment() {
    const nameRaw = addFormNameInput.value.trim();
    const textRaw = addFormTextInput.value.trim();
    if (nameRaw === "" || textRaw === "") {
        alert("Пожалуйста, заполните все поля!");
        return;
    }
    const name = sanitizeInput(nameRaw);
    const text = sanitizeInput(textRaw);
    const dateNow = new Date();

   const payload = {
        name,
        text,
        date: dateNow.toISOString()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка: ${response.status} ${errorText}`);
        }
        const newComment = await response.json();
        // Можно обновить список комментариев
        await loadComments();
        // Очистить поля формы
        addFormNameInput.value = "";
        addFormTextInput.value = "";
    } catch (error) {
        console.error('Ошибка при отправке комментария:', error);
        alert(`Не удалось отправить комментарий: ${error.message}`);
    }
}

// Обработчик кнопки
addFormButton.addEventListener("click", () => {
    sendComment();
});

// Изначальная загрузка
loadComments();