window.navegarParaGlobal = navegarPara;

async function navegarPara(pageName) {
    const transition = document.getElementById('pageTransition');

    // Esconde o conteúdo atual suavemente
    document.body.style.opacity = '0';
    if (transition) transition.classList.add('active');

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const fetchUrl = `${pageName}.json`;  // Alterado para .json para evitar problemas de cache
        console.log("Carregando:", fetchUrl);

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Substitui todo o body diretamente (abordagem mais robusta)
        document.body.innerHTML = html;

        // Remove a transição e mostra o novo conteúdo
        setTimeout(() => {
            document.body.style.opacity = '1';
            if (transition) transition.classList.remove('active');

            // Recarrega scripts manualmente
            document.querySelectorAll('script[src]').forEach(oldScript => {
                const newScript = document.createElement('script');
                newScript.src = oldScript.src;
                document.body.appendChild(newScript);
            });

            // Atualiza o histórico
            window.history.pushState({ page: pageName }, '', `/${pageName}`);

            // Executa funções de inicialização se existirem
            if (typeof initPage === 'function') {
                initPage();
            }
        }, 50);

    } catch (error) {
        console.error('Falha na navegação:', error);
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