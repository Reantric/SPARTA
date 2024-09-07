export class ContextMenu {
    contextMenuElement: HTMLElement;

    constructor() {
        this.contextMenuElement = document.getElementById('context-menu');
    }

    show(x: number, y: number, options: { label: string, action: () => void, icon?: string }[]) {
        this.contextMenuElement.innerHTML = `
            <div class="content">
                <ul class="cmenu">
                    ${options.map(opt => `
                        <li class="item">
                            ${opt.icon ? `<i class="${opt.icon}"></i>` : ''}
                            <span>${opt.label}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        const items = this.contextMenuElement.querySelectorAll('.item');
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                options[index].action();
                this.hide();
            });
        });

        this.contextMenuElement.style.left = `${x}px`;
        this.contextMenuElement.style.top = `${y}px`;
        this.contextMenuElement.style.display = 'block';
    }

    hide() {
        this.contextMenuElement.style.display = 'none';
    }
}
