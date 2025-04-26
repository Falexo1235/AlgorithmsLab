const backButton = document.createElement('a');
backButton.classList.add('back-button');
backButton.href = '../index.html';
backButton.textContent = '← Назад';

document.body.appendChild(backButton);