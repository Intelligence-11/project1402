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
    
    const codeForFinal = document.getElementById('codeForFinal');
    const copyFinalCodeBtnInline = document.getElementById('copyFinalCodeBtnInline');
    
    const confirmModal = document.getElementById('confirmModal');
    const resetBtn = document.getElementById('resetBtn2025');
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmModalClose = document.querySelector('#confirmModal .modal-close');

    // ============= ПРАВИЛЬНЫЕ ОТВЕТЫ =============
    const correctAnswers = {
        // Радио-кнопка
        'birthday-song': 'yarmak',     // Bahh Tee - 10 Лет Спустя
        // Текстовые с конкретным ответом
        'prince-concert': 'принц',
        'love-scale': '∞',
        // Эти вопросы принимают ЛЮБОЙ ответ
        'good-memory': 'any',
        'future-wish': 'any'
    };

    // ============= КОДЫ =============
    const yearCode = '5';                  // Финальная цифра
    const finalMainCode = '52345';        // Полный главный код

    // ============= СОСТОЯНИЕ =============
    let completedMemories = JSON.parse(localStorage.getItem('2025_completed')) || [];
    let unlockedDigit = localStorage.getItem('2025_digit') || null;

    // ============= ИНИЦИАЛИЗАЦИЯ =============
    function init() {
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
                memoryElement.classList.remove('hidden');
                button.classList.add('opened');
                button.innerHTML = '<i class="fas fa-check"></i> Воспоминание открыто';
                button.disabled = true;
                
                // Для радио-кнопок
                if (memoryId === 'birthday-song') {
                    const answerBtn = document.querySelector(`#memory-${memoryId} .answer-btn`);
                    if (answerBtn) {
                        answerBtn.classList.add('correct');
                        answerBtn.textContent = 'Правильно!';
                        answerBtn.disabled = true;
                        
                        const radioButtons = document.querySelectorAll(`#memory-${memoryId} input[type="radio"]`);
                        radioButtons.forEach(radio => radio.disabled = true);
                    }
                } 
                // Для текстовых вопросов
                else {
                    const answerBtn = document.querySelector(`#memory-${memoryId} .text-answer-btn`);
                    const textInput = document.getElementById(`${memoryId}-answer`);
                    
                    if (answerBtn) {
                        answerBtn.classList.add('correct');
                        answerBtn.textContent = memoryId === 'good-memory' || memoryId === 'future-wish' ? 'Сохранено!' : 'Правильно!';
                        answerBtn.disabled = true;
                    }
                    
                    if (textInput) {
                        textInput.disabled = true;
                        const savedAnswer = localStorage.getItem(`2025_answer_${memoryId}`);
                        if (savedAnswer) textInput.value = savedAnswer;
                    }
                }
            }
        });
        
        if (unlockedDigit) {
            yearCodeDigit.textContent = unlockedDigit;
            yearCodeDigit.classList.add('revealed');
        }
        
        if (completedMemories.length === 5) {
            showFinalCode();
        }
    }

    // ============= НАСТРОЙКА КНОПОК =============
    function setupButtons() {
        revealButtons.forEach(button => {
            button.addEventListener('click', function() {
                const memoryId = this.dataset.memory;
                openMemory(memoryId, this);
            });
        });
        
        // Кнопки радио-ответов
        answerButtons.forEach(button => {
            if (!button.classList.contains('text-answer-btn')) {
                button.addEventListener('click', function() {
                    const memoryId = this.closest('.memory-content').id.replace('memory-', '');
                    checkRadioAnswer(memoryId, this);
                });
            }
        });
        
        // Кнопки текстовых ответов
        document.querySelectorAll('.text-answer-btn').forEach(button => {
            button.addEventListener('click', function() {
                const memoryId = this.dataset.memory;
                checkTextAnswer(memoryId, this);
            });
        });
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                confirmModal.style.display = 'flex';
            });
        }
        
        if (confirmResetBtn) {
            confirmResetBtn.addEventListener('click', resetProgress);
        }
        if (cancelResetBtn) {
            cancelResetBtn.addEventListener('click', () => confirmModal.style.display = 'none');
        }
        if (confirmModalClose) {
            confirmModalClose.addEventListener('click', () => confirmModal.style.display = 'none');
        }
        
        if (copyAllCodesBtn) {
            copyAllCodesBtn.addEventListener('click', copyFinalCodeToClipboard);
        }
        if (closeFinalModalBtn) {
            closeFinalModalBtn.addEventListener('click', () => finalCodesModal.style.display = 'none');
        }
        if (finalModalCloseBtn) {
            finalModalCloseBtn.addEventListener('click', () => finalCodesModal.style.display = 'none');
        }
        
        if (copyFinalCodeBtnInline) {
            copyFinalCodeBtnInline.addEventListener('click', () => {
                copyToClipboard(finalMainCode, 'Главный код скопирован!');
            });
        }
        
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
            
            memoryElement.style.opacity = '0';
            memoryElement.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                memoryElement.style.transition = 'all 0.5s ease';
                memoryElement.style.opacity = '1';
                memoryElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    // ============= ПРОВЕРКА РАДИО-ОТВЕТА =============
    function checkRadioAnswer(memoryId, button) {
        const options = button.parentElement.querySelectorAll('input[type="radio"]');
        let selectedValue = null;
        
        options.forEach(option => {
            if (option.checked) {
                selectedValue = option.value;
            }
        });
        
        if (!selectedValue) {
            showNotification('Выбери вариант ответа!', 'error');
            return;
        }
        
        const correctAnswer = correctAnswers[memoryId];
        
        if (selectedValue === correctAnswer) {
            handleCorrectAnswer(memoryId, button, options);
        } else {
            handleIncorrectAnswer(button);
        }
    }

    // ============= ПРОВЕРКА ТЕКСТОВОГО ОТВЕТА =============
    function checkTextAnswer(memoryId, button) {
        const input = document.getElementById(`${memoryId}-answer`);
        if (!input) return;
        
        const answer = input.value.trim();
        const correctAnswer = correctAnswers[memoryId];
        
        // Вопросы, которые принимают ЛЮБОЙ ответ
        if (correctAnswer === 'any') {
            if (answer.length > 0) {
                handleCorrectAnswer(memoryId, button, null, answer);
            } else {
                showNotification('Напиши что-нибудь!', 'error');
            }
            return;
        }
        
        // Вопрос с бесконечностью
        if (memoryId === 'love-scale') {
            if (answer === '∞' || answer === 'бесконечность' || answer === 'infinity' || answer === 'бесконечно') {
                handleCorrectAnswer(memoryId, button, null, '∞');
            } else {
                handleIncorrectAnswer(button);
            }
            return;
        }
        
        // Обычные текстовые вопросы
        const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, ' ').trim();
        const normalizedCorrect = correctAnswer.toLowerCase();
        
        if (normalizedAnswer === normalizedCorrect) {
            handleCorrectAnswer(memoryId, button, null, answer);
        } else {
            handleIncorrectAnswer(button);
        }
    }

    // ============= ОБРАБОТКА ПРАВИЛЬНОГО ОТВЕТА =============
    function handleCorrectAnswer(memoryId, button, options = null, textAnswer = '') {
        if (memoryId === 'good-memory' || memoryId === 'future-wish') {
            button.textContent = 'Сохранено!';
        } else {
            button.textContent = 'Правильно!';
        }
        button.classList.add('correct');
        button.disabled = true;
        
        const timelineDot = document.querySelector(`[data-memory="${memoryId}"] .timeline-dot`);
        if (timelineDot) {
            timelineDot.classList.add('completed');
        }
        
        if (options) {
            options.forEach(option => {
                option.disabled = true;
            });
        }
        
        const input = document.getElementById(`${memoryId}-answer`);
        if (input) {
            input.disabled = true;
        }
        
        if (!completedMemories.includes(memoryId)) {
            completedMemories.push(memoryId);
            localStorage.setItem('2025_completed', JSON.stringify(completedMemories));
            
            if (textAnswer) {
                localStorage.setItem(`2025_answer_${memoryId}`, textAnswer);
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
        if (completedMemories.length === 5 && !unlockedDigit) {
            unlockAllCodes();
        }
    }

    // ============= ОТКРЫТИЕ ВСЕХ КОДОВ =============
    function unlockAllCodes() {
        yearCodeDigit.textContent = yearCode;
        yearCodeDigit.classList.add('revealed');
        
        showFinalCode();
        
        localStorage.setItem('2025_digit', yearCode);
        localStorage.setItem('main_code_2025', yearCode);
        localStorage.setItem('year_2025_unlocked', 'true');
        localStorage.setItem('final_main_code', finalMainCode);
        localStorage.setItem('all_years_completed', 'true');
        
        unlockedDigit = yearCode;
        
        setTimeout(() => {
            if (modalMainDigit) modalMainDigit.textContent = yearCode;
            if (finalCodesModal) finalCodesModal.style.display = 'flex';
        }, 1000);
        
        showNotification('Поздравляю! Ты прошла весь путь! ❤️', 'success');
    }

    // ============= ПОКАЗАТЬ ФИНАЛЬНЫЙ КОД =============
    function showFinalCode() {
        if (codeForFinal) {
            codeForFinal.classList.remove('hidden');
            
            codeForFinal.style.opacity = '0';
            codeForFinal.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                codeForFinal.style.transition = 'all 0.6s ease';
                codeForFinal.style.opacity = '1';
                codeForFinal.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // ============= КОПИРОВАНИЕ КОДОВ =============
    function copyFinalCodeToClipboard() {
        copyToClipboard(finalMainCode, 'Главный код скопирован!');
    }

    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification(successMessage, 'success'))
            .catch(() => showNotification('Не удалось скопировать', 'error'));
    }

    // ============= СБРОС ПРОГРЕССА =============
    function resetProgress() {
        confirmModal.style.display = 'none';
        
        localStorage.removeItem('2025_completed');
        localStorage.removeItem('2025_digit');
        localStorage.removeItem('main_code_2025');
        localStorage.removeItem('year_2025_unlocked');
        localStorage.removeItem('final_main_code');
        localStorage.removeItem('all_years_completed');
        localStorage.removeItem('2025_answer_birthday-song');
        localStorage.removeItem('2025_answer_prince-concert');
        localStorage.removeItem('2025_answer_good-memory');
        localStorage.removeItem('2025_answer_future-wish');
        localStorage.removeItem('2025_answer_love-scale');
        
        completedMemories = [];
        unlockedDigit = null;
        
        resetUI();
        updateProgressDisplay();
        showNotification('Прогресс 2025 года сброшен', 'success');
    }

    // ============= СБРОС UI =============
    function resetUI() {
        yearCodeDigit.textContent = '?';
        yearCodeDigit.classList.remove('revealed');
        
        if (codeForFinal) codeForFinal.classList.add('hidden');
        
        document.querySelectorAll('.memory-content').forEach(memory => {
            memory.classList.add('hidden');
        });
        
        document.querySelectorAll('.reveal-btn').forEach(btn => {
            btn.classList.remove('opened');
            btn.innerHTML = '<i class="fas fa-lock"></i> Раскрыть воспоминание';
            btn.disabled = false;
        });
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
            btn.textContent = btn.classList.contains('text-answer-btn') ? 'Ответить' : 'Ответить';
            btn.disabled = false;
        });
        
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
            radio.disabled = false;
        });
        
        const textInputs = [
            'prince-concert-answer',
            'good-memory-answer',
            'future-wish-answer',
            'love-scale-answer'
        ];
        
        textInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
                input.disabled = false;
            }
        });
        
        document.querySelectorAll('.timeline-dot.completed').forEach(dot => {
            dot.classList.remove('completed');
        });
    }

    // ============= ОБНОВЛЕНИЕ ПРОГРЕССА =============
    function updateProgressDisplay() {
        if (completedCount) completedCount.textContent = completedMemories.length;
        const progressPercent = (completedMemories.length / 5) * 100;
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

    // ============= ДОБАВЛЯЕМ СТИЛИ ДЛЯ TEXTAREA =============
    function addTextareaStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .textarea-large {
                min-height: 120px;
                resize: vertical;
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
            }
        `;
        document.head.appendChild(style);
    }

    // ============= ЗАПУСК =============
    addTextareaStyles();
    init();
});