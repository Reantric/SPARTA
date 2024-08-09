const menu = document.getElementById('menu');
const resizer = document.getElementById('resizer');
let isResizing = false;
let startX;
let startWidth;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = parseInt(document.defaultView.getComputedStyle(menu).width, 10);
    document.addEventListener('mousemove', resizeMenu);
    document.addEventListener('mouseup', stopResize);
});

function resizeMenu(e) {
    if (isResizing) {
        const newWidth = startWidth + (e.clientX - startX);
        menu.style.width = newWidth + 'px';
    }
}

function stopResize() {
    if (isResizing) {
        document.removeEventListener('mousemove', resizeMenu);
        document.removeEventListener('mouseup', stopResize);
        isResizing = false;
    }
}
