window.navegarParaGlobal = navegarPara;

async function navegarPara(pageName) {
    // Se já estiver na página solicitada, não faz nada
    if (window.location.pathname === `/${pageName}`) return;

    const transition = document.getElementById('pageTransition');
    if (transition) transition.classList.add('active');

    try {
        // 1. Faz a requisição da página
        const response = await fetch(`${pageName}.html`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);

        // 2. Obtém o conteúdo HTML
        const html = await response.text();

        // 3. Cria um elemento temporário para parsear o HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 4. Verifica se o conteúdo existe
        if (!doc.body || !doc.body.innerHTML) {
            throw new Error('Conteúdo HTML inválido');
        }

        // 5. Substitui todo o conteúdo do body
        document.body.innerHTML = doc.body.innerHTML;

        // 6. Recarrega os scripts dinamicamente
        const scripts = Array.from(document.scripts);
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src + '?v=' + Date.now(); // Cache busting
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });

        // 7. Atualiza o histórico
        window.history.pushState({ page: pageName }, '', `/${pageName}`);

        // 8. Finaliza a transição
        setTimeout(() => {
            if (transition) transition.classList.remove('active');

            // Dispara eventos de inicialização
            if (typeof initPage === 'function') {
                initPage();
            }
        }, 300);

    } catch (error) {
        console.error('Erro na navegação:', error);
        // Fallback: recarrega a página tradicionalmente
        window.location.href = `${pageName}.html`;
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