document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const revealButtons = document.querySelectorAll('.reveal-btn');
    const answerButtons = document.querySelectorAll('.answer-btn');
    const yearCodeDigit = document.getElementById('yearCodeDigit');
    const completedCount = document.getElementById('completedCount');
    const memoryProgress = document.getElementById('memoryProgress');
    const codeModal = document.getElementById('codeModal');
    const modalCodeDigit = document.getElementById('modalCodeDigit');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalCloseBtn = document.querySelector('#codeModal .modal-close');
    const resetBtn = document.getElementById('resetBtn2021');
    const helpBtnMay = document.getElementById('help-btn-may');
    const additionalCode = document.getElementById('additionalCode');
    
    const confirmModal = document.getElementById('confirmModal');
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmModalClose = document.querySelector('#confirmModal .modal-close');
    
    let completedMemories = JSON.parse(localStorage.getItem('2021_completed')) || [];
    let unlockedDigit = localStorage.getItem('2021_digit') || null;
    let yearCode = '5';
    let code2022 = '7459';
    
    const correctAnswers = {
        'may': {
            main: 'мстители',
            help: 'человек паук'
        },
        'july': {
            her: 'я с тобою как в раю для тебя дышу для тебя пою',
            me: 'две судьбы в одну слились узлами крепкими сплелись'
        }
    };
    
    function init() {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 2000);
        
        restoreProgress();
        setupButtons();
        updateProgressDisplay();
        
        if (completedMemories.length === 5) {
            showAdditionalCode();
        }
    }
    
    function restoreProgress() {
        completedMemories.forEach(memory => {
            const memoryElement = document.getElementById(`memory-${memory}`);
            if (memoryElement) {
                memoryElement.classList.remove('hidden');
                const button = document.querySelector(`[data-memory="${memory}"]`);
                if (button) {
                    button.classList.add('opened');
                    button.innerHTML = '<i class="fas fa-check"></i> Воспоминание открыто';
                }
                if (memory === 'may' || memory === 'july') {
                    disableQuestion(memory);
                }
            }
        });
        
        if (unlockedDigit) {
            yearCodeDigit.textContent = unlockedDigit;
            yearCodeDigit.classList.add('revealed');
        }
    }
    
    function setupButtons() {
        revealButtons.forEach(button => {
            button.addEventListener('click', function() {
                const memoryId = this.dataset.memory;
                openMemory(memoryId, this);
            });
        });
        
        answerButtons.forEach(button => {
            if (!button.classList.contains('text-answer-btn')) {
                button.addEventListener('click', function() {
                    const memoryId = this.closest('.memory-content').id.replace('memory-', '');
                    checkRadioAnswer(memoryId, this);
                });
            }
        });
        
        document.querySelectorAll('.text-answer-btn').forEach(button => {
            button.addEventListener('click', function() {
                const memoryId = this.dataset.memory;
                checkTextAnswer(memoryId, this);
            });
        });
        
        if (helpBtnMay) {
            helpBtnMay.addEventListener('click', function() {
                const helpQuestion = document.getElementById('help-question-may');
                helpQuestion.classList.remove('hidden');
                this.style.display = 'none';
                helpQuestion.style.opacity = '0';
                helpQuestion.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    helpQuestion.style.transition = 'all 0.5s ease';
                    helpQuestion.style.opacity = '1';
                    helpQuestion.style.transform = 'translateY(0)';
                }, 10);
            });
        }
        
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
        
        confirmModal.addEventListener('click', function(e) {
            if (e.target === confirmModal) {
                confirmModal.style.display = 'none';
            }
        });
        
        copyCodeBtn.addEventListener('click', copyAllCodesToClipboard);
        closeModalBtn.addEventListener('click', () => codeModal.style.display = 'none');
        modalCloseBtn.addEventListener('click', () => codeModal.style.display = 'none');
        
        codeModal.addEventListener('click', function(e) {
            if (e.target === codeModal) {
                codeModal.style.display = 'none';
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (codeModal.style.display === 'flex') codeModal.style.display = 'none';
                if (confirmModal.style.display === 'flex') confirmModal.style.display = 'none';
            }
        });
    }
    
    function openMemory(memoryId, button) {
        const memoryElement = document.getElementById(`memory-${memoryId}`);
        if (memoryElement.classList.contains('hidden')) {
            memoryElement.classList.remove('hidden');
            button.classList.add('opened');
            button.innerHTML = '<i class="fas fa-check"></i> Воспоминание открыто';
            memoryElement.style.opacity = '0';
            memoryElement.style.transform = 'translateY(10px)';
            setTimeout(() => {
                memoryElement.style.transition = 'all 0.5s ease';
                memoryElement.style.opacity = '1';
                memoryElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }
    
    function checkRadioAnswer(memoryId, button) {
        const options = button.parentElement.querySelectorAll('input[type="radio"]');
        let selectedValue = null;
        options.forEach(option => {
            if (option.checked) selectedValue = option.value;
        });
        if (!selectedValue) {
            showNotification('Выбери вариант ответа!', 'error');
            return;
        }
        const correctAnswer = button.dataset.correct;
        if (selectedValue === correctAnswer) {
            handleCorrectAnswer(memoryId, button, options);
        } else {
            handleIncorrectAnswer(button);
        }
    }
    
    function checkTextAnswer(memoryId, button) {
        if (memoryId === 'may') {
            checkMovieAnswer(memoryId, button);
        } else if (memoryId === 'july') {
            checkVKAnswer(memoryId, button);
        }
    }
    
    function checkMovieAnswer(memoryId, button) {
        const mainAnswer = document.getElementById('movie-answer').value.trim().toLowerCase();
        const helpAnswer = document.getElementById('movie-answer2')?.value.trim().toLowerCase() || '';
        const helpQuestion = document.getElementById('help-question-may');
        const helpUsed = !helpQuestion.classList.contains('hidden');
        
        const normalizedMain = mainAnswer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ').trim();
        const normalizedHelp = helpAnswer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ').trim();
        
        const correctMain = correctAnswers[memoryId].main;
        const correctHelp = correctAnswers[memoryId].help;
        
        let isCorrect = false;
        if (helpUsed) {
            isCorrect = normalizedHelp === correctHelp;
            if (isCorrect) showNotification('Спасалка сработала! Ответ засчитан.', 'success');
        } else {
            isCorrect = normalizedMain === correctMain;
        }
        
        if (isCorrect) {
            handleCorrectAnswer(memoryId, button);
            document.getElementById('movie-answer').disabled = true;
            if (document.getElementById('movie-answer2')) document.getElementById('movie-answer2').disabled = true;
        } else {
            handleIncorrectAnswer(button);
        }
    }
    
    function checkVKAnswer(memoryId, button) {
        const herAnswer = document.getElementById('vk-answer-her').value.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        const meAnswer = document.getElementById('vk-answer-me').value.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        const correctHer = correctAnswers[memoryId].her;
        const correctMe = correctAnswers[memoryId].me;
        const normalizedHer = herAnswer.replace(/\s+/g, ' ').trim();
        const normalizedMe = meAnswer.replace(/\s+/g, ' ').trim();
        
        if (normalizedHer === correctHer && normalizedMe === correctMe) {
            handleCorrectAnswer(memoryId, button);
            document.getElementById('vk-answer-her').disabled = true;
            document.getElementById('vk-answer-me').disabled = true;
        } else {
            let message = 'Не совсем... ';
            if (normalizedHer !== correctHer && normalizedMe !== correctMe) message += 'Оба ответа неправильные.';
            else if (normalizedHer !== correctHer) message += 'Ответ про твой статус неправильный.';
            else message += 'Ответ про мой статус неправильный.';
            handleIncorrectAnswer(button, message);
        }
    }
    
    function handleCorrectAnswer(memoryId, button, options = null) {
        if (button.classList.contains('text-answer-btn')) {
            button.textContent = 'Правильно!';
        } else {
            button.classList.add('correct');
            button.textContent = 'Правильно!';
        }
        button.disabled = true;
        
        if (!completedMemories.includes(memoryId)) {
            completedMemories.push(memoryId);
            localStorage.setItem('2021_completed', JSON.stringify(completedMemories));
            checkAllMemoriesCompleted();
        }
        
        if (options) {
            options.forEach(option => { option.disabled = true; });
        }
        
        showNotification('Верно! Воспоминание сохранено.', 'success');
        updateProgressDisplay();
    }
    
    function handleIncorrectAnswer(button, customMessage = null) {
        if (button.classList.contains('text-answer-btn')) {
            button.textContent = 'Попробуй ещё раз';
            setTimeout(() => { button.textContent = 'Ответить'; }, 2000);
        } else {
            button.classList.add('incorrect');
            button.textContent = 'Попробуй ещё раз';
            setTimeout(() => {
                button.classList.remove('incorrect');
                button.textContent = 'Ответить';
            }, 2000);
        }
        showNotification(customMessage || 'Не совсем... Попробуй ещё раз!', 'error');
    }
    
    function disableQuestion(memoryId) {
        if (memoryId === 'may') {
            const input1 = document.getElementById('movie-answer');
            const input2 = document.getElementById('movie-answer2');
            const button = document.querySelector('#memory-may .text-answer-btn');
            if (input1) input1.disabled = true;
            if (input2) input2.disabled = true;
            if (button) { button.textContent = 'Правильно!'; button.disabled = true; }
        } else if (memoryId === 'july') {
            const inputHer = document.getElementById('vk-answer-her');
            const inputMe = document.getElementById('vk-answer-me');
            const button = document.querySelector('#memory-july .text-answer-btn');
            if (inputHer) inputHer.disabled = true;
            if (inputMe) inputMe.disabled = true;
            if (button) { button.textContent = 'Правильно!'; button.disabled = true; }
        }
    }
    
    function checkAllMemoriesCompleted() {
        const totalMemories = 5;
        if (completedMemories.length === totalMemories) {
            if (!unlockedDigit) unlockYearCode();
            showAdditionalCode();
        }
    }
    
    function unlockYearCode() {
        yearCodeDigit.textContent = yearCode;
        yearCodeDigit.classList.add('revealed');
        localStorage.setItem('2021_digit', yearCode);
        unlockedDigit = yearCode;
        localStorage.setItem('main_code_2021', yearCode);
        setTimeout(() => {
            modalCodeDigit.textContent = yearCode;
            codeModal.style.display = 'flex';
        }, 1000);
        showNotification('Поздравляем! Ты открыла цифру 2021 года!', 'success');
    }
    
    function showAdditionalCode() {
        if (additionalCode) {
            additionalCode.classList.remove('hidden');
            additionalCode.style.opacity = '0';
            additionalCode.style.transform = 'translateY(20px)';
            setTimeout(() => {
                additionalCode.style.transition = 'all 0.6s ease';
                additionalCode.style.opacity = '1';
                additionalCode.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    function resetProgress() {
        confirmModal.style.display = 'none';
        localStorage.removeItem('2021_completed');
        localStorage.removeItem('2021_digit');
        localStorage.removeItem('main_code_2021');
        completedMemories = [];
        unlockedDigit = null;
        resetUI();
        updateProgressDisplay();
        if (additionalCode) additionalCode.classList.add('hidden');
        showNotification('Прогресс 2021 года сброшен!', 'success');
    }
    
    function resetUI() {
        yearCodeDigit.textContent = '?';
        yearCodeDigit.classList.remove('revealed');
        document.querySelectorAll('.memory-content').forEach(memory => memory.classList.add('hidden'));
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
        document.querySelectorAll('.text-answer').forEach(input => {
            input.value = '';
            input.disabled = false;
        });
        const helpQuestion = document.getElementById('help-question-may');
        if (helpQuestion) helpQuestion.classList.add('hidden');
        if (helpBtnMay) helpBtnMay.style.display = 'inline-flex';
    }
    
    function copyAllCodesToClipboard() {
        const textToCopy = `Цифра для главного кода: ${yearCode}\nКод для 2022 года: ${code2022}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                setTimeout(() => {
                    copyCodeBtn.innerHTML = '<i class="fas fa-copy"></i> Скопировать оба кода';
                }, 2000);
            })
            .catch(() => showNotification('Не удалось скопировать коды', 'error'));
    }
    
    function updateProgressDisplay() {
        completedCount.textContent = completedMemories.length;
        const progressPercent = (completedMemories.length / 5) * 100;
        memoryProgress.style.width = `${progressPercent}%`;
    }
    
    function showNotification(message, type = 'success') {
        document.querySelectorAll('.year-notification').forEach(n => n.remove());
        const notification = document.createElement('div');
        notification.className = `year-notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    init();
});