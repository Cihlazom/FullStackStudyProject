// Автоматически добавляет timestamp к JS файлам
const timestamp = Date.now();
const scripts = document.querySelectorAll('script[src]');
scripts.forEach(script => {
    if (!script.src.includes('?')) {
        script.src += `?t=${timestamp}`;
    }
});
