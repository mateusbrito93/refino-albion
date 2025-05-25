async function navegarPara(url) {
    const transition = document.getElementById('pageTransition');
    const content = document.getElementById('contentWrapper');

    // Animação de saída
    if (content) content.style.opacity = '0';
    if (transition) transition.classList.add('active');

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Carrega a nova página
        const response = await fetch(url);
        const html = await response.text();

        // Cria um elemento temporário para parsear o HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Extrai o conteúdo do body
        const newContent = tempDiv.querySelector('body').innerHTML;

        // Substitui o conteúdo mantendo a estrutura base
        document.body.innerHTML = `
            <div id="pageTransition" class="page-transition">
                <span class="loader"></span>
            </div>
            <div id="contentWrapper" class="content-wrapper" style="opacity:0">
                ${newContent}
            </div>
        `;

        // Recarrega os scripts dinamicamente
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
        });

        // Atualiza a URL
        window.history.pushState({}, '', url);

        // Animação de entrada
        setTimeout(() => {
            const newContentWrapper = document.getElementById('contentWrapper');
            if (newContentWrapper) newContentWrapper.style.opacity = '1';
            document.getElementById('pageTransition').classList.remove('active');
        }, 50);

    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        window.location.href = url;
    }
}

function setupIndexCards() {
    document.querySelectorAll('.card-refino').forEach(card => {
        const onclickAttr = card.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/redirecionar\('([^']+)'\)/);
            if (match && match[1]) {
                const tipo = match[1];
                if (tipo !== '#') {
                    card.onclick = (e) => {
                        e.preventDefault();
                        window.navegarParaGlobal(tipo);
                    };
                } else {
                    card.onclick = (e) => {
                        e.preventDefault();
                        console.warn("Navegação para '#' não configurada.");
                    };
                }
            }
        }
    });
}

function redirecionar(tipo) {
    if (tipo && tipo !== '#') {
        window.navegarParaGlobal(tipo);
    } else {
        console.warn("Tentativa de redirecionar para '#' ou tipo inválido.");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupIndexCards);
} else {
    setupIndexCards();
}

window.addEventListener('popstate', function (event) {
    if (event.state && event.state.page) {
        window.location.reload();
    }
});