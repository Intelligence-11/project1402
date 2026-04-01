document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const timeRemaining = document.getElementById('timeRemaining');
    const loadingDays = document.getElementById('loadingDays');
    const messages = document.querySelectorAll('.message');
    
    // Время загрузки в миллисекундах
    const TOTAL_LOADING_TIME = 7000; // 7 секунд
    const MESSAGE_CHANGE_INTERVAL = TOTAL_LOADING_TIME / 6; // 6 сообщений
    
    let startTime = Date.now();
    let currentMessageIndex = 0;
    let remainingSeconds = 7;
    
    // Рассчитываем количество дней
    function calculateDaysTogether() {
        const startDate = new Date(2021, 1, 14); // 14 февраля 2021
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        loadingDays.textContent = diffDays;
    }
    
    // Обновление прогресса
    function updateProgress() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / TOTAL_LOADING_TIME, 1);
        
        // Обновляем прогресс-бар
        const progressPercentValue = Math.floor(progress * 100);
        progressFill.style.width = `${progressPercentValue}%`;
        progressPercent.textContent = `${progressPercentValue}%`;
        
        // Обновляем оставшееся время
        remainingSeconds = Math.max(0, 7 - Math.floor(elapsedTime / 1000));
        timeRemaining.textContent = `${remainingSeconds} секунд${remainingSeconds === 1 ? 'а' : ''}`;
        
        // Переключаем сообщения
        const messageIndex = Math.min(Math.floor(progress * 6), 5);
        if (messageIndex > currentMessageIndex) {
            currentMessageIndex = messageIndex;
            changeMessage(currentMessageIndex);
        }
        
        // Если загрузка завершена
        if (progress >= 1) {
            completeLoading();
        } else {
            requestAnimationFrame(updateProgress);
        }
    }
    
    // Смена сообщения
    function changeMessage(index) {
        // Скрываем все сообщения
        messages.forEach(message => {
            message.classList.remove('active');
        });
        
        // Показываем текущее сообщение
        if (messages[index]) {
            messages[index].classList.add('active');
        }
    }
    
    // Завершение загрузки
    function completeLoading() {
        // Показываем 100%
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        timeRemaining.textContent = '0 секунд';
        
        // Показываем последнее сообщение
        changeMessage(5);
        
        // Плавный переход на главную страницу
        setTimeout(() => {
            // Добавляем класс для анимации исчезновения
            document.querySelector('.loading-container').classList.add('fade-out');
            
            setTimeout(() => {
                // Проверяем, был ли уже введён пароль
                const isUnlocked = localStorage.getItem('capsule_unlocked') === 'true';
                
                if (isUnlocked) {
                    // Если пароль уже введён, идём сразу на главную
                    window.location.href = 'main.html';
                } else {
                    // Если нет, идём на главную страницу (у нас нет отдельной password.html)
                    window.location.href = 'main.html';
                }
            }, 500); // Даём время на анимацию
        }, 1000);
    }
    
    // Добавляем стиль для анимации исчезновения
    const style = document.createElement('style');
    style.textContent = `
        .loading-container.fade-out {
            animation: fadeOut 0.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: scale(1);
            }
            to {
                opacity: 0;
                transform: scale(0.95);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация
    function init() {
        calculateDaysTogether();
        
        // Показываем первое сообщение
        changeMessage(0);
        
        // Запускаем прогресс
        setTimeout(() => {
            updateProgress();
        }, 500); // Небольшая задержка перед началом
        
        // Добавляем дополнительные плавающие сердечки
        addFloatingHearts();
    }
    
    // Добавляем дополнительные сердечки для красоты
    function addFloatingHearts() {
        const background = document.querySelector('.loading-background');
        const heartCount = 10;
        
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '<i class="fas fa-heart"></i>';
            
            // Случайная позиция
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = 0.8 + Math.random() * 1.5;
            const duration = 20 + Math.random() * 20;
            const delay = Math.random() * -20;
            
            heart.style.left = `${left}%`;
            heart.style.top = `${top}%`;
            heart.style.fontSize = `${size}rem`;
            heart.style.animationDuration = `${duration}s`;
            heart.style.animationDelay = `${delay}s`;
            heart.style.opacity = `${0.05 + Math.random() * 0.1}`;
            
            background.appendChild(heart);
        }
    }
    
    // Запуск
    init();
});