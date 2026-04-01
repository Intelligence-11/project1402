// ============================================
// КАПСУЛА ВРЕМЕНИ - ГЛАВНАЯ СТРАНИЦА
// Полностью переработанный JS код
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // ============= КОНФИГУРАЦИЯ =============
    const CONFIG = {
        // Коды доступа к годам
        yearCodes: {
            '2022': '7459', // Становление
            '2023': '8102', // Глубина
            '2024': '9631', // Гармония
            '2025': '7182'  // Будущее
        },
        // Главный финальный код (5 цифр)
        mainCode: '52345',
        // Соответствие годов и папок
        yearPageMap: {
            '2021': '2021',
            '2022': '2022',
            '2023': '2023',
            '2024': '2024',
            '2025': '2025' // для 2025-26
        },
        // Отображаемые названия годов
        yearDisplayNames: {
            '2021': '2021',
            '2022': '2022',
            '2023': '2023',
            '2024': '2024',
            '2025': '2025-26'
        }
    };

    // ============= ЭЛЕМЕНТЫ DOM =============
    const elements = {
        // Главная страница
        daysCount: document.getElementById('daysCount'),
        yearCards: document.querySelectorAll('.year-card'),
        
        // Модальное окно кода года
        yearCodeModal: document.getElementById('yearCodeModal'),
        modalYearTitle: document.getElementById('modalYearTitle'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        codeInputDisplay: document.getElementById('yearCodeDisplay'),
        codeDigitInputs: document.querySelectorAll('.code-digit-input'),
        keyButtons: document.querySelectorAll('.key-btn'),
        clearCodeBtn: document.getElementById('clearCodeBtn'),
        submitYearCodeBtn: document.getElementById('submitYearCodeBtn'),
        yearCodeError: document.getElementById('yearCodeError'),
        
        // Главный код
        checkMainCodeBtn: document.getElementById('checkMainCodeBtn'),
        clearMainCodeBtn: document.getElementById('clearMainCodeBtn'),
        mainCodeDigits: document.querySelectorAll('.main-code-digit .digit-number'),
        collectedDigitsSpan: document.getElementById('collectedDigits'),
        progressFill: document.getElementById('progressFill'),
        
        // Кнопка обнуления
        resetBtn: document.getElementById('resetBtn')
    };

    // ============= СОСТОЯНИЕ ПРИЛОЖЕНИЯ =============
    const state = {
        // Для модального окна ввода кода
        currentYear: null,
        currentCodeInput: ['', '', '', ''],
        currentDigitIndex: 0
    };

    // ============= ИНИЦИАЛИЗАЦИЯ =============
    function init() {
        calculateDaysTogether();
        initializeYearsFromStorage();
        setupCodeDigitInputs();
        updateMainCodeDisplay();
        setupEventListeners();
        setupResetModal();
    }

    // ============= РАБОТА С ДАТАМИ =============
    function calculateDaysTogether() {
        const startDate = new Date(2021, 1, 14); // 14 февраля 2021
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (elements.daysCount) elements.daysCount.textContent = diffDays;
    }

    // ============= РАБОТА С ПРОГРЕССОМ ГОДОВ =============
    
    /**
     * Загружает статус годов из localStorage и обновляет карточки
     */
    function initializeYearsFromStorage() {
        elements.yearCards.forEach(card => {
            const year = card.dataset.year;
            
            // 2021 год всегда разблокирован
            if (year === '2021') return;
            
            const isUnlocked = localStorage.getItem(`year_${year}_unlocked`) === 'true';
            
            if (isUnlocked) {
                unlockYearCard(year, card);
            }
        });
    }

    /**
     * Разблокирует карточку года: меняет замок на ссылку
     */
    function unlockYearCard(year, card = null) {
        // Если карточка не передана, находим её
        const yearCard = card || document.querySelector(`.year-card[data-year="${year}"]`);
        if (!yearCard) return;
        
        // Обновляем статус
        yearCard.dataset.unlocked = 'true';
        
        // Находим элемент статуса
        const statusElement = yearCard.querySelector('.year-status');
        if (!statusElement) return;
        
        // Получаем название папки из маппинга
        const folderName = CONFIG.yearPageMap[year];
        if (!folderName) return;
        
        // Создаём ссылку вместо замка
        statusElement.outerHTML = `
            <a href="pages/${folderName}/${folderName}.html" class="year-status unlocked">
                <i class="fas fa-check-circle"></i>
                <span>Открыть</span>
            </a>
        `;
    }

    /**
     * Блокирует карточку года (при сбросе)
     */
    function lockYearCard(year) {
        const yearCard = document.querySelector(`.year-card[data-year="${year}"]`);
        if (!yearCard) return;
        
        yearCard.dataset.unlocked = 'false';
        
        const statusElement = yearCard.querySelector('.year-status');
        if (!statusElement) return;
        
        // Заменяем ссылку обратно на замок
        statusElement.outerHTML = `
            <div class="year-status locked" data-year="${year}">
                <i class="fas fa-lock"></i>
                <span>Нужен код</span>
            </div>
        `;
    }

    // ============= РАБОТА С ГЛАВНЫМ КОДОМ =============
    
    /**
     * Обновляет отображение главного кода и прогресс
     */
    function updateMainCodeDisplay() {
        let collectedCount = 0;
        const mainCodeDigitsElements = document.querySelectorAll('.main-code-digit');
        
        mainCodeDigitsElements.forEach(digitElement => {
            const year = digitElement.dataset.year;
            const digitNumber = digitElement.querySelector('.digit-number');
            const digitValue = digitNumber.textContent.trim();
            
            // Проверяем, введена ли цифра
            if (digitValue && digitValue !== '?' && /^\d$/.test(digitValue)) {
                digitElement.classList.add('filled');
                collectedCount++;
                
                // Сохраняем в localStorage
                localStorage.setItem(`main_code_${year}`, digitValue);
            } else {
                digitElement.classList.remove('filled');
                
                // Восстанавливаем из localStorage если есть
                const savedValue = localStorage.getItem(`main_code_${year}`);
                if (savedValue && /^\d$/.test(savedValue)) {
                    digitNumber.textContent = savedValue;
                    digitElement.classList.add('filled');
                    collectedCount++;
                }
            }
        });
        
        // Обновляем прогресс
        if (elements.collectedDigitsSpan) {
            elements.collectedDigitsSpan.textContent = collectedCount;
        }
        
        const progressPercent = (collectedCount / 5) * 100;
        if (elements.progressFill) {
            elements.progressFill.style.width = `${progressPercent}%`;
        }
        
        // Активируем/деактивируем кнопку проверки
        if (elements.checkMainCodeBtn) {
            elements.checkMainCodeBtn.disabled = collectedCount < 5;
        }
    }

    /**
     * Настраивает поля ввода для главного кода
     */
    function setupCodeDigitInputs() {
        if (!elements.mainCodeDigits.length) return;
        
        elements.mainCodeDigits.forEach(digit => {
            // Фокус - очищаем если стоит '?'
            digit.addEventListener('focus', function() {
                if (this.textContent === '?') {
                    this.textContent = '';
                }
            });
            
            // Потеря фокуса - ставим '?' если пусто
            digit.addEventListener('blur', function() {
                if (this.textContent.trim() === '') {
                    this.textContent = '?';
                }
                updateMainCodeDisplay();
            });
            
            // Ввод - только одна цифра
            digit.addEventListener('input', function(e) {
                let value = this.textContent.replace(/\D/g, '');
                
                if (value.length > 1) {
                    value = value.charAt(0);
                }
                
                this.textContent = value;
                
                // Автопереход к следующему полю
                if (value.length === 1) {
                    const currentIndex = Array.from(elements.mainCodeDigits).indexOf(this);
                    if (currentIndex < elements.mainCodeDigits.length - 1) {
                        elements.mainCodeDigits[currentIndex + 1].focus();
                    }
                }
            });
            
            // Навигация стрелками и backspace
            digit.addEventListener('keydown', function(e) {
                const currentIndex = Array.from(elements.mainCodeDigits).indexOf(this);
                
                if (e.key === 'ArrowRight' && currentIndex < elements.mainCodeDigits.length - 1) {
                    e.preventDefault();
                    elements.mainCodeDigits[currentIndex + 1].focus();
                } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    e.preventDefault();
                    elements.mainCodeDigits[currentIndex - 1].focus();
                } else if (e.key === 'Backspace' && this.textContent === '') {
                    e.preventDefault();
                    if (currentIndex > 0) {
                        elements.mainCodeDigits[currentIndex - 1].focus();
                    }
                }
            });
        });
    }

    /**
     * Проверяет главный код и открывает финальный сюрприз
     */
    function checkMainCode() {
        // Собираем введённый код
        let enteredCode = '';
        elements.mainCodeDigits.forEach(digit => {
            const value = digit.textContent.trim();
            if (value && value !== '?') {
                enteredCode += value;
            }
        });
        
        if (enteredCode.length !== 5) {
            showNotification('Введи все 5 цифр!', 'error');
            return;
        }
        
        if (enteredCode === CONFIG.mainCode) {
            // Код верный - переходим на финальную страницу
            window.location.href = 'pages/final/final.html';
        } else {
            showNotification('Неверный код! Попробуй ещё раз.', 'error');
            
            // Анимация ошибки
            const codeDisplay = document.querySelector('.main-code-display');
            if (codeDisplay) {
                codeDisplay.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    codeDisplay.style.animation = '';
                }, 500);
            }
        }
    }

    /**
     * Очищает главный код
     */
    function clearMainCode() {
        if (confirm('Очистить все введённые цифры главного кода?')) {
            elements.mainCodeDigits.forEach(digit => {
                digit.textContent = '?';
                // Удаляем сохранённые значения
                const year = digit.closest('.main-code-digit')?.dataset.year;
                if (year) {
                    localStorage.removeItem(`main_code_${year}`);
                }
            });
            
            updateMainCodeDisplay();
            showNotification('Код очищен! Можешь ввести заново.', 'success');
        }
    }

    // ============= МОДАЛЬНОЕ ОКНО ВВОДА КОДА ГОДА =============
    
    /**
     * Открывает модальное окно для ввода кода года
     */
    function openYearCodeModal(year) {
        state.currentYear = year;
        if (elements.modalYearTitle) {
            elements.modalYearTitle.textContent = CONFIG.yearDisplayNames[year] || year;
        }
        
        // Сбрасываем ввод
        state.currentCodeInput = ['', '', '', ''];
        state.currentDigitIndex = 0;
        
        // Сбрасываем отображение
        elements.codeDigitInputs.forEach(input => {
            input.textContent = '';
            input.classList.remove('filled');
        });
        
        // Скрываем ошибку
        if (elements.yearCodeError) {
            elements.yearCodeError.style.display = 'none';
        }
        
        // Показываем модальное окно
        if (elements.yearCodeModal) {
            elements.yearCodeModal.style.display = 'flex';
        }
    }

    /**
     * Закрывает модальное окно
     */
    function closeYearCodeModal() {
        if (elements.yearCodeModal) {
            elements.yearCodeModal.style.display = 'none';
        }
        state.currentYear = null;
        state.currentCodeInput = ['', '', '', ''];
        state.currentDigitIndex = 0;
    }

    /**
     * Обновляет отображение введённого кода
     */
    function updateCodeInputDisplay() {
        elements.codeDigitInputs.forEach((input, index) => {
            if (state.currentCodeInput[index]) {
                input.textContent = state.currentCodeInput[index];
                input.classList.add('filled');
            } else {
                input.textContent = '';
                input.classList.remove('filled');
            }
        });
        
        // Скрываем ошибку при вводе
        if (elements.yearCodeError) {
            elements.yearCodeError.style.display = 'none';
        }
    }

    /**
     * Добавляет цифру в код
     */
    function addDigitToCode(digit) {
        if (state.currentDigitIndex < 4) {
            state.currentCodeInput[state.currentDigitIndex] = digit;
            state.currentDigitIndex++;
            updateCodeInputDisplay();
        }
    }

    /**
     * Удаляет последнюю цифру
     */
    function removeLastDigit() {
        if (state.currentDigitIndex > 0) {
            state.currentDigitIndex--;
            state.currentCodeInput[state.currentDigitIndex] = '';
            updateCodeInputDisplay();
        }
    }

    /**
     * Проверяет введённый код года
     */
    function checkYearCode() {
        const enteredCode = state.currentCodeInput.join('');
        const yearToOpen = state.currentYear;
        
        // Проверяем код
        if (CONFIG.yearCodes[yearToOpen] && enteredCode === CONFIG.yearCodes[yearToOpen]) {
            // Код верный - сохраняем в localStorage
            localStorage.setItem(`year_${yearToOpen}_unlocked`, 'true');
            
            // Разблокируем карточку
            unlockYearCard(yearToOpen);
            
            // Закрываем модальное окно
            closeYearCodeModal();
            
            // Показываем уведомление
            const displayName = CONFIG.yearDisplayNames[yearToOpen] || yearToOpen;
            showNotification(`Доступ к ${displayName} году открыт!`, 'success');
            
        } else {
            // Код неверный
            if (elements.yearCodeError) {
                elements.yearCodeError.style.display = 'flex';
            }
            if (elements.codeInputDisplay) {
                elements.codeInputDisplay.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    elements.codeInputDisplay.style.animation = '';
                }, 500);
            }
        }
    }

    // ============= УВЕДОМЛЕНИЯ =============
    
    /**
     * Показывает уведомление
     */
    function showNotification(message, type = 'success') {
        // Удаляем старые уведомления
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Автоудаление
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // ============= СБРОС ПРОГРЕССА =============
    
    /**
     * Создаёт модальное окно для сброса прогресса
     */
    function setupResetModal() {
        // Создаём HTML модального окна
        const resetModalHTML = `
            <div class="reset-modal" id="resetModal">
                <div class="reset-modal-content">
                    <div class="reset-modal-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="reset-modal-title">Обнулить прогресс?</h3>
                    <p class="reset-modal-text">
                        Это сбросит все введённые коды и прогресс по годам.<br>
                        Ты уверена, что хочешь начать всё заново?
                    </p>
                    <div class="reset-modal-actions">
                        <button class="reset-modal-btn reset-modal-confirm" id="confirmResetBtn">
                            Да, обнулить
                        </button>
                        <button class="reset-modal-btn reset-modal-cancel" id="cancelResetBtn">
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем в DOM
        document.body.insertAdjacentHTML('beforeend', resetModalHTML);
        
        // Получаем элементы
        const resetModal = document.getElementById('resetModal');
        const confirmResetBtn = document.getElementById('confirmResetBtn');
        const cancelResetBtn = document.getElementById('cancelResetBtn');
        
        if (!resetModal || !confirmResetBtn || !cancelResetBtn) return;
        
        // Открыть модальное окно
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', () => {
                resetModal.style.display = 'flex';
            });
        }
        
        // Подтвердить сброс
        confirmResetBtn.addEventListener('click', () => {
            resetAllProgress();
            resetModal.style.display = 'none';
        });
        
        // Отменить сброс
        cancelResetBtn.addEventListener('click', () => {
            resetModal.style.display = 'none';
        });
        
        // Закрыть по клику на фон
        resetModal.addEventListener('click', (e) => {
            if (e.target === resetModal) {
                resetModal.style.display = 'none';
            }
        });
        
        // Закрыть по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && resetModal.style.display === 'flex') {
                resetModal.style.display = 'none';
            }
        });
    }

    /**
     * Полный сброс всего прогресса
     */
    function resetAllProgress() {
        // Очищаем весь localStorage
        localStorage.clear();
        
        // Сбрасываем статусы всех годов (кроме 2021)
        document.querySelectorAll('.year-card').forEach(card => {
            const year = card.dataset.year;
            if (year !== '2021') {
                lockYearCard(year);
            }
        });
        
        // Сбрасываем главный код
        elements.mainCodeDigits.forEach(digit => {
            digit.textContent = '?';
        });
        
        // Обновляем отображение
        updateMainCodeDisplay();
        
        // Показываем уведомление
        showNotification('Прогресс успешно сброшен!', 'success');
    }

    // ============= НАСТРОЙКА ОБРАБОТЧИКОВ =============
    
    function setupEventListeners() {
        // ===== КАРТОЧКИ ГОДОВ =====
        elements.yearCards.forEach(card => {
            card.addEventListener('click', function(e) {
                const year = this.dataset.year;
                const isUnlocked = this.dataset.unlocked === 'true';
                
                // Не открываем модалку для разблокированных годов и для 2021
                if (isUnlocked || year === '2021') return;
                
                // Открываем модальное окно
                if (!e.target.closest('.year-status')) {
                    openYearCodeModal(year);
                }
            });
        });
        
        // ===== МОДАЛЬНОЕ ОКНО =====
        if (elements.closeModalBtn) {
            elements.closeModalBtn.addEventListener('click', closeYearCodeModal);
        }
        
        if (elements.yearCodeModal) {
            elements.yearCodeModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeYearCodeModal();
                }
            });
        }
        
        // ===== ВИРТУАЛЬНАЯ КЛАВИАТУРА =====
        elements.keyButtons.forEach(button => {
            if (button.dataset.key) {
                button.addEventListener('click', function() {
                    addDigitToCode(this.dataset.key);
                });
            }
        });
        
        // Кнопка очистки
        if (elements.clearCodeBtn) {
            elements.clearCodeBtn.addEventListener('click', removeLastDigit);
        }
        
        // Кнопка подтверждения
        if (elements.submitYearCodeBtn) {
            elements.submitYearCodeBtn.addEventListener('click', checkYearCode);
        }
        
        // ===== ФИЗИЧЕСКАЯ КЛАВИАТУРА =====
        document.addEventListener('keydown', function(e) {
            if (elements.yearCodeModal?.style.display === 'flex') {
                if (e.key >= '0' && e.key <= '9') {
                    addDigitToCode(e.key);
                } else if (e.key === 'Backspace') {
                    removeLastDigit();
                } else if (e.key === 'Enter') {
                    checkYearCode();
                } else if (e.key === 'Escape') {
                    closeYearCodeModal();
                }
            }
        });
        
        // ===== ГЛАВНЫЙ КОД =====
        if (elements.checkMainCodeBtn) {
            elements.checkMainCodeBtn.addEventListener('click', checkMainCode);
        }
        
        if (elements.clearMainCodeBtn) {
            elements.clearMainCodeBtn.addEventListener('click', clearMainCode);
        }
    }

    // ============= ДОБАВЛЯЕМ СТИЛИ ДЛЯ УВЕДОМЛЕНИЙ =============
    function addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 15px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                z-index: 1001;
                transform: translateX(150%);
                transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                max-width: 400px;
                min-width: 280px;
                backdrop-filter: blur(10px);
                color: white;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                background: linear-gradient(135deg, #27ae60, #229954);
            }
            
            .notification.error {
                background: linear-gradient(135deg, #ff6b6b, #ff4757);
            }
            
            .notification i {
                font-size: 1.5rem;
            }
            
            .notification span {
                font-size: 1rem;
                line-height: 1.5;
                font-weight: 500;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }

    // ============= ЗАПУСК =============
    addNotificationStyles();
    init();
});