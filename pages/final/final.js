document.addEventListener('DOMContentLoaded', function() {
    // Плавное появление контента
    document.querySelector('.final-content').classList.add('animate-in');
    
    // Автоматически подгоняем размер видео
    const video = document.querySelector('.final-video');
    if (video) {
        video.addEventListener('loadedmetadata', function() {
            console.log('🎬 Наше видео готово к просмотру');
        });
    }
    
    // Маленькая пасхалка в консоль
    console.log('%c❤️ 5 лет — это только начало ❤️', 'font-size: 20px; color: #c49a2b; font-weight: bold;');
    console.log('%cСпасибо, что прошла этот путь до конца', 'font-size: 16px; color: #7a6a5a; font-style: italic;');
});