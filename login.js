var popup = document.getElementById("popup");

function login() {
    console.log("Login function called");
    const form = document.forms['LoginForm'];
    const email = form.Email.value;
    const password = form.Password.value;
    const result = document.getElementById("result");

    // Клиентская валидация
    if (email === "") {
        result.innerHTML = "Введите ваш email*";
        return false;
    } else if (password === "") {
        result.innerHTML = "Введите пароль*";
        return false;
    }

    console.log("Sending login request:", { email, password });

    // Отправка данных на бэкенд
    fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            console.log("Response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Response data:", data);
            if (data.message === 'Вход успешен') {
                localStorage.setItem('token', data.token);
                popup.classList.add("open-slide");
            } else {
                result.innerHTML = data.message;
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            result.innerHTML = 'Ошибка при входе';
        });

    return false; // Предотвращаем стандартную отправку формы
}

function CloseSlide() {
    popup.classList.remove("open-slide");
    window.location.href = 'dashboard.html'; // Перенаправление в личный кабинет
}