document.addEventListener('DOMContentLoaded', () => {
    const contextMenu = document.getElementById('context-menu');

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const posX = e.pageX;
        const posY = e.pageY;

        // Update context menu for non-node-related actions

        contextMenu.style.left = `${posX}px`;
        contextMenu.style.top = `${posY}px`;
        contextMenu.style.display = 'block';
    });

    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
});
