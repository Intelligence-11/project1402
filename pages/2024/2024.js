document.addEventListener('DOMContentLoaded', function() {
    // ============= ЭЛЕМЕНТЫ =============
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('mainContent');
    const revealButtons = document.querySelectorAll('.reveal-btn');
    const answerButtons = document.querySelectorAll('.answer-btn');
    const yearCodeDigit = document.getElementById('yearCodeDigit');
    const completedCount = document.getElementById('completedCount');
    const memoryProgress = document.getElementById('memoryProgress');
    const finalCodesModal = document.getElementById('finalCodesModal');
    const modalMainDigit = document.getElementById('modalMainDigit');
    const copyAllCodesBtn = document.getElementById('copyAllCodesBtn');
    const closeFinalModalBtn = document.getElementById('closeFinalModalBtn');
    const finalModalCloseBtn = document.querySelector('#finalCodesModal .modal-close');
    
    const codeFor2025 = document.getElementById('codeFor2025');
    const copyCode2025BtnInline = document.getElementById('copyCode2025BtnInline');
    
    const confirmModal = document.getElementById('confirmModal');
    const resetBtn = document.getElementById('resetBtn2024');
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmModalClose = document.querySelector('#confirmModal .modal-close');

    // ============= ПРАВИЛЬНЫЕ ОТВЕТЫ =============
    const correctAnswers = {
        'arcade': 'автомат с игрушками',
        'hedgehog': 'ёжик',
        'grandma': 'до бабушки на др'
    };

    // ============= КОДЫ =============
    const yearCode = '4';                  // Цифра для главного кода
    const code2025 = '7182';              // Код для 2025 года

    // ============= СОСТОЯНИЕ =============
    let completedMemories = JSON.parse(localStorage.getItem('2024_completed')) || [];
    let unlockedDigit = localStorage.getItem('2024_digit') || null;

    // ============= ИНИЦИАЛИЗАЦИЯ =============
    function init() {
        // Загрузочный экран
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContent.style.opacity = '1';
            }, 500);
        }, 1500);
        
        restoreProgress();
        setupButtons();
        updateProgressDisplay();
    }

    // ============= ВОССТАНОВЛЕНИЕ ПРОГРЕССА =============
    function restoreProgress() {
        completedMemories.forEach(memoryId => {
            const memoryElement = document.getElementById(`memory-${memoryId}`);
            const button = document.querySelector(`[data-memory="${memoryId}"]`);
            
            if (memoryElement && button) {
                // Открываем воспоминание
                memoryElement.classList.remove('hidden');
                button.classList.add('opened');
                button.innerHTML = '<i class="fas fa-check"></i> Воспоминание открыто';
                button.disabled = true;
                
                // Отмечаем вопрос как пройденный
                const answerBtn = document.querySelector(`#memory-${memoryId} .text-answer-btn`);
                const textInput = document.getElementById(`${memoryId}-answer`);
                
                if (answerBtn) {
                    answerBtn.classList.add('correct');
                    answerBtn.textContent = 'Правильно!';
                    answerBtn.disabled = true;
                }
                
                if (textInput) {
                    textInput.disabled = true;
                    // Восстанавливаем сохранённый ответ, если есть
                    const savedAnswer = localStorage.getItem(`2024_answer_${memoryId}`);
                    if (savedAnswer) textInput.value = savedAnswer;
                }
            }
        });
        
        // Восстанавливаем цифру кода
        if (unlockedDigit) {
            yearCodeDigit.textContent = unlockedDigit;
            yearCodeDigit.classList.add('revealed');
        }
        
        // Если все пройдено (3 вопроса), показываем код для 2025
        if (completedMemories.length === 3) {
            showCodeFor2025();
        }
    }

    // ============= НАСТРОЙКА КНОПОК =============
    function setupButtons() {
        // Кнопки раскрытия воспоминаний
        revealButtons.forEach(button => {
            button.addEventListener('click', function() {
                const memoryId = this.dataset.memory;
                openMemory(memoryId, this);
            });
        });
        
        // Кнопки текстовых ответов (все вопросы текстовые)
        document.querySelectorAll('.text-answer-btn').forEach(button => {
            button.addEventListener('click', function() {
                const memoryId = this.dataset.memory;
                checkTextAnswer(memoryId, this);
            });
        });
        
        // Кнопка сброса прогресса
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                confirmModal.style.display = 'flex';
            });
        }
        
        // Кнопки модального окна подтверждения
        if (confirmResetBtn) {
            confirmResetBtn.addEventListener('click', resetProgress);
        }
        if (cancelResetBtn) {
            cancelResetBtn.addEventListener('click', () => confirmModal.style.display = 'none');
        }
        if (confirmModalClose) {
            confirmModalClose.addEventListener('click', () => confirmModal.style.display = 'none');
        }
        
        // Кнопки единого модального окна
        if (copyAllCodesBtn) {
            copyAllCodesBtn.addEventListener('click', copyAllCodesToClipboard);
        }
        if (closeFinalModalBtn) {
            closeFinalModalBtn.addEventListener('click', () => finalCodesModal.style.display = 'none');
        }
        if (finalModalCloseBtn) {
            finalModalCloseBtn.addEventListener('click', () => finalCodesModal.style.display = 'none');
        }
        
        // Кнопка копирования кода 2025
        if (copyCode2025BtnInline) {
            copyCode2025BtnInline.addEventListener('click', () => {
                copyToClipboard(code2025, 'Код для 2025 года скопирован!');
            });
        }
        
        // Закрытие модальных окон по клику на фон
        const modals = [confirmModal, finalCodesModal];
        modals.forEach(modal => {
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (finalCodesModal?.style.display === 'flex') {
                    finalCodesModal.style.display = 'none';
                }
                if (confirmModal?.style.display === 'flex') {
                    confirmModal.style.display = 'none';
                }
            }
        });
    }

    // ============= ОТКРЫТИЕ ВОСПОМИНАНИЯ =============
    function openMemory(memoryId, button) {
        const memoryElement = document.getElementById(`memory-${memoryId}`);
        
        if (memoryElement?.classList.contains('hidden')) {
            memoryElement.classList.remove('hidden');
            button.classList.add('opened');
            button.innerHTML = '<i class="fas fa-check"></i> Воспоминание открыто';
            button.disabled = true;
            
            // Плавная анимация
            memoryElement.style.opacity = '0';
            memoryElement.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                memoryElement.style.transition = 'all 0.5s ease';
                memoryElement.style.opacity = '1';
                memoryElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    // ============= ПРОВЕРКА ТЕКСТОВОГО ОТВЕТА =============
    function checkTextAnswer(memoryId, button) {
        const input = document.getElementById(`${memoryId}-answer`);
        if (!input) return;
        
        const answer = input.value.trim().toLowerCase();
        const correctAnswer = correctAnswers[memoryId];
        
        // Нормализуем ответ (убираем лишние пробелы, приводим к нижнему регистру)
        const normalizedAnswer = answer.replace(/\s+/g, ' ').trim().toLowerCase();
        const normalizedCorrect = correctAnswer.toLowerCase();
        
        // Проверяем на точное совпадение
        if (normalizedAnswer === normalizedCorrect) {
            handleCorrectAnswer(memoryId, button, input.value);
        } else {
            handleIncorrectAnswer(button);
        }
    }

    // ============= ОБРАБОТКА ПРАВИЛЬНОГО ОТВЕТА =============
    function handleCorrectAnswer(memoryId, button, textAnswer = '') {
        button.classList.add('correct');
        button.textContent = 'Правильно!';
        button.disabled = true;
        
        // Добавляем класс completed к точке на временной шкале
        const timelineDot = document.querySelector(`[data-memory="${memoryId}"] .timeline-dot`);
        if (timelineDot) {
            timelineDot.classList.add('completed');
        }
        
        // Отключаем текстовое поле
        const input = document.getElementById(`${memoryId}-answer`);
        if (input) {
            input.disabled = true;
        }
        
        // Сохраняем прогресс
        if (!completedMemories.includes(memoryId)) {
            completedMemories.push(memoryId);
            localStorage.setItem('2024_completed', JSON.stringify(completedMemories));
            
            // Сохраняем текстовый ответ
            if (textAnswer) {
                localStorage.setItem(`2024_answer_${memoryId}`, textAnswer);
            }
            
            checkAllMemoriesCompleted();
        }
        
        showNotification('Верно! Воспоминание сохранено.', 'success');
        updateProgressDisplay();
    }

    // ============= ОБРАБОТКА НЕПРАВИЛЬНОГО ОТВЕТА =============
    function handleIncorrectAnswer(button) {
        button.classList.add('incorrect');
        button.textContent = 'Попробуй ещё раз';
        
        setTimeout(() => {
            button.classList.remove('incorrect');
            button.textContent = 'Ответить';
        }, 2000);
        
        showNotification('Не совсем... Попробуй ещё раз!', 'error');
    }

    // ============= ПРОВЕРКА ВСЕХ ВОСПОМИНАНИЙ =============
    function checkAllMemoriesCompleted() {
        // Всего 3 вопроса в 2024 году
        if (completedMemories.length === 3 && !unlockedDigit) {
            unlockAllCodes();
        }
    }

    // ============= ОТКРЫТИЕ ВСЕХ КОДОВ =============
    function unlockAllCodes() {
        // Показываем цифру
        yearCodeDigit.textContent = yearCode;
        yearCodeDigit.classList.add('revealed');
        
        // Показываем код для 2025 года
        showCodeFor2025();
        
        // Сохраняем в localStorage
        localStorage.setItem('2024_digit', yearCode);
        localStorage.setItem('main_code_2024', yearCode);
        localStorage.setItem('year_2024_unlocked', 'true');
        unlockedDigit = yearCode;
        
        // Показываем модальное окно
        setTimeout(() => {
            if (modalMainDigit) modalMainDigit.textContent = yearCode;
            if (finalCodesModal) finalCodesModal.style.display = 'flex';
        }, 1000);
        
        showNotification('Поздравляем! Ты открыла все коды 2024 года!', 'success');
    }

    // ============= ПОКАЗАТЬ КОД ДЛЯ 2025 =============
    function showCodeFor2025() {
        if (codeFor2025) {
            codeFor2025.classList.remove('hidden');
            
            codeFor2025.style.opacity = '0';
            codeFor2025.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                codeFor2025.style.transition = 'all 0.6s ease';
                codeFor2025.style.opacity = '1';
                codeFor2025.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // ============= КОПИРОВАНИЕ КОДОВ =============
    function copyAllCodesToClipboard() {
        const textToCopy = `Цифра для главного кода: ${yearCode}\nКод для 2025 года: ${code2025}`;
        copyToClipboard(textToCopy, 'Оба кода скопированы!');
    }

    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification(successMessage, 'success'))
            .catch(() => showNotification('Не удалось скопировать', 'error'));
    }

    // ============= СБРОС ПРОГРЕССА =============
    function resetProgress() {
        confirmModal.style.display = 'none';
        
        // Очищаем localStorage
        localStorage.removeItem('2024_completed');
        localStorage.removeItem('2024_digit');
        localStorage.removeItem('main_code_2024');
        localStorage.removeItem('year_2024_unlocked');
        localStorage.removeItem('2024_answer_arcade');
        localStorage.removeItem('2024_answer_hedgehog');
        localStorage.removeItem('2024_answer_grandma');
        
        // Сбрасываем состояние
        completedMemories = [];
        unlockedDigit = null;
        
        // Сбрасываем UI
        resetUI();
        updateProgressDisplay();
        showNotification('Прогресс 2024 года сброшен!', 'success');
    }

    // ============= СБРОС UI =============
    function resetUI() {
        // Сбрасываем цифру кода
        yearCodeDigit.textContent = '?';
        yearCodeDigit.classList.remove('revealed');
        
        // Скрываем код для 2025
        if (codeFor2025) codeFor2025.classList.add('hidden');
        
        // Закрываем все воспоминания
        document.querySelectorAll('.memory-content').forEach(memory => {
            memory.classList.add('hidden');
        });
        
        // Сбрасываем кнопки раскрытия
        document.querySelectorAll('.reveal-btn').forEach(btn => {
            btn.classList.remove('opened');
            btn.innerHTML = '<i class="fas fa-lock"></i> Раскрыть воспоминание';
            btn.disabled = false;
        });
        
        // Сбрасываем кнопки ответов
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
            btn.textContent = 'Ответить';
            btn.disabled = false;
        });
        
        // Сбрасываем текстовые поля
        const inputs = ['arcade-answer', 'hedgehog-answer', 'grandma-answer'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
                input.disabled = false;
            }
        });
        
        // Убираем completed с точек
        document.querySelectorAll('.timeline-dot.completed').forEach(dot => {
            dot.classList.remove('completed');
        });
    }

    // ============= ОБНОВЛЕНИЕ ПРОГРЕССА =============
    function updateProgressDisplay() {
        if (completedCount) completedCount.textContent = completedMemories.length;
        const progressPercent = (completedMemories.length / 3) * 100; // 3 вопроса
        if (memoryProgress) memoryProgress.style.width = `${progressPercent}%`;
    }

    // ============= УВЕДОМЛЕНИЯ =============
    function showNotification(message, type = 'success') {
        document.querySelectorAll('.year-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `year-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============= ЗАПУСК =============
    init();
});