window.navegarParaGlobal = navegarPara;

async function navegarPara(pageName) {
    const transition = document.getElementById('pageTransition');
    const content = document.getElementById('contentWrapper');

    if (content) content.style.opacity = '0';
    if (transition) transition.classList.add('active');

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const fetchUrl = `${pageName}.html`;
        console.log("Carregando:", fetchUrl);

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`Falha ao carregar a página ${fetchUrl}: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Verifica se existe #contentWrapper ou usa o body inteiro
        const newContent = tempDiv.querySelector('#contentWrapper') || tempDiv.querySelector('body');
        if (!newContent) {
            throw new Error(`Não foi possível encontrar o conteúdo em ${fetchUrl}`);
        }

        const pageTransitionDivPreserved = document.getElementById('pageTransition');
        document.body.innerHTML = ''; // Limpa o body atual

        if (pageTransitionDivPreserved) {
            document.body.appendChild(pageTransitionDivPreserved);
        }

        // Se a página for 'index', substitui todo o body
        if (pageName === 'index') {
            document.body.innerHTML = html;
        }
        // Caso contrário, usa o #contentWrapper ou o body do novo HTML
        else {
            const newContentWrapper = document.createElement('div');
            newContentWrapper.id = 'contentWrapper';
            newContentWrapper.className = 'content-wrapper';
            newContentWrapper.style.opacity = '0';
            newContentWrapper.innerHTML = newContent.innerHTML;
            document.body.appendChild(newContentWrapper);
        }

        // Recarrega scripts dinamicamente
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

        window.history.pushState({ page: pageName }, '', `/${pageName}`);

        setTimeout(() => {
            const freshContentWrapper = document.getElementById('contentWrapper');
            if (freshContentWrapper) freshContentWrapper.style.opacity = '1';

            const pt = document.getElementById('pageTransition');
            if (pt) pt.classList.remove('active');

            const lang = localStorage.getItem("lang") || "pt";
            if (typeof updateLanguage === "function" && typeof translations === "object") {
                updateLanguage(lang);
            }
            if (typeof rebuildForm === "function" && typeof formTranslations === "object") {
                rebuildForm(lang);
            }
            if (pageName === 'index') {
                setupIndexCards();
            }
        }, 50);

    } catch (error) {
        console.error('Erro ao carregar a página:', error.message, error.stack);
        // Fallback: recarrega a página se a navegação SPA falhar
        window.location.href = fetchUrl;
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