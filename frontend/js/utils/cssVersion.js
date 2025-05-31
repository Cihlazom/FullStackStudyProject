// Добавляем timestamp к CSS для принудительного обновления
document.addEventListener('DOMContentLoaded', function() {
    const timestamp = new Date().getTime();
    const cssFiles = ['variables.css', 'main.css', 'components.css', 'responsive.css'];

    cssFiles.forEach(file => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/${file}?t=${timestamp}`;
        document.head.appendChild(link);
    });
});
