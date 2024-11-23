export function showMessage(message: string, type: 'success' | 'error' = 'success') {
  const div = document.createElement('div');
  div.textContent = message;
  div.className = `message message-${type}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}