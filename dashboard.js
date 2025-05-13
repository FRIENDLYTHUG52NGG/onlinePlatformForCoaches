// document.addEventListener('DOMContentLoaded', () => {
//     loadUserData();
// });

// function loadUserData() {
//     const token = localStorage.getItem('token');
//     const username = localStorage.getItem('username');

//     console.log('Токен:', token);
//     console.log('Имя пользователя:', username);

//     if (!token) {
//         console.error('Токен отсутствует, перенаправление на регистрацию');
//         redirectToSignUp();
//         return;
//     }

//     if (username) {
//         document.getElementById('username').textContent = username;
//     }

//     fetch('http://localhost:5000/api/check-auth', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(response => {
//         console.log('Статус check-auth:', response.status);
//         if (!response.ok) {
//             throw new Error(`Ошибка проверки авторизации: ${response.status}`);
//         }
//         return response.json();
//     })
//     .then(data => {
//         console.log('Ответ check-auth:', data);
//         if (!data.isAuthenticated) {
//             console.error('Пользователь не авторизован, перенаправление');
//             redirectToSignUp();
//             return;
//         }

//         // Загрузка данных пользователя
//         fetch('http://localhost:5000/api/dashboard', {
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         })
//         .then(response => {
//             console.log('Статус dashboard:', response.status);
//             if (!response.ok) {
//                 throw new Error('Ошибка загрузки данных пользователя');
//             }
//             return response.json();
//         })
//         .then(userData => {
//             console.log('Данные пользователя:', userData);
//             if (userData.username) {
//                 document.getElementById('username').textContent = userData.username;
//                 localStorage.setItem('username', userData.username);
//             }
//         })
//         .catch(error => {
//             console.error('Ошибка загрузки данных:', error);
//             redirectToSignUp();
//         });
//     })
//     .catch(error => {
//         console.error('Ошибка проверки авторизации:', error);
//         redirectToSignUp();
//     });
// }

// function redirectToSignUp() {
//     console.log('Перенаправление на signUp.html');
//     // Временно отключаем удаление токена для отладки
//     // localStorage.removeItem('token');
//     // localStorage.removeItem('username');
//     window.location.href = 'signUp.html';
// }

// function logout() {
//     console.log('Выход из системы');
//     localStorage.removeItem('token');
//     localStorage.removeItem('username');
//     window.location.href = './signUp';
// }