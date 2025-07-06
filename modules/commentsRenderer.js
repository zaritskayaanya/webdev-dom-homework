import { sanitizeInput } from './utils.js';

export function renderComments(comments, containerEl) {
  containerEl.innerHTML = '';

  comments.forEach((comment, index) => {
    const date = new Date(comment.date);
    const formattedDate = formatDate(date);
    const likeClass = comment.isLiked ? "-active-like" : "";

    containerEl.innerHTML += `
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
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}.${m}.${y} ${hh}:${mm}`;
}
