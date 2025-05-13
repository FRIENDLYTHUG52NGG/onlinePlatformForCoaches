document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница signUp.html загружена');
    const form = document.getElementById('registerForm');
    if (!form) {
        console.error('Форма с ID "registerForm" не найдена');
        return;
    }
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Форма отправлена');
        registerUser();
    });
});

function registerUser() {
    console.log('Запуск функции registerUser');
    const form = document.getElementById('registerForm');
    const result = document.getElementById('result');
    
    // Собираем данные формы
    const username = form.querySelector('input[name="username"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const cpassword = form.querySelector('input[name="cpassword"]').value;
    
    console.log('Введённые данные:', { username, email, password, cpassword });

    // Минимальная валидация
    if (!username || !email || !password || !cpassword) {
        result.innerText = 'Заполните все поля';
        result.style.color = 'red';
        console.error('Ошибка: не все поля заполнены', { username, email, password, cpassword });
        return;
    }

    const userData = { username, email, password, cpassword };
    console.log('Отправка данных на сервер:', userData);

    // Отправка запроса
    fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => {
        console.log('Статус ответа:', response.status);
        if (!response.ok) {
            return response.json().then(err => {
                console.error('Ошибка сервера:', err);
                throw new Error(err.message || 'Ошибка сервера');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Получен ответ от сервера:', data);
        if (data && typeof data === 'object' && data.token && data.username) {
            console.log('Сохранение в localStorage');
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            console.log('Сохранено в localStorage:', {
                token: data.token,
                username: data.username
            });
            // Перенаправление
            console.log('Попытка перенаправления');
            try {
                window.location.href = 'dashboard.html';
                console.log('Перенаправление выполнено (href)');
                // Резервный вариант
                setTimeout(() => {
                    console.log('Резервное перенаправление');
                    window.location.assign('dashboard.html');
                    console.log('Перенаправление выполнено (assign)');
                }, 500);
            } catch (e) {
                console.error('Ошибка перенаправления:', e);
                result.innerText = 'Ошибка перенаправления: ' + e.message;
                result.style.color = 'red';
            }
        } else {
            console.error('Ошибка: ответ не содержит token или username', data);
            result.innerText = 'Ошибка: сервер не вернул необходимые данные';
            result.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Ошибка запроса:', error.message);
        result.innerText = error.message || 'Ошибка при регистрации';
        result.style.color = 'red';
    });
}