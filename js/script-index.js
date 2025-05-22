// Expor globalmente a função navegarPara
window.navegarParaGlobal = navegarPara;

// No início do arquivo js/script-index.js ou onde 'navegarPara' é definida
async function navegarPara(pageName) {
    const transition = document.getElementById('pageTransition');
    const content = document.getElementById('contentWrapper');

    if (content) content.style.opacity = '0';
    if (transition) transition.classList.add('active');

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const fetchUrl = `${pageName}.html`; // Constrói o nome do arquivo .html

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`Falha ao carregar a página ${fetchUrl}: ${response.status} ${response.statusText}`);
        }
        const html = await response.text();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const newBodyContent = tempDiv.querySelector('body')?.innerHTML;
        if (!newBodyContent) {
            throw new Error(`Não foi possível encontrar o conteúdo do body em ${fetchUrl}`);
        }

        const pageTransitionDivPreserved = document.getElementById('pageTransition'); // Salva o nó da transição

        document.body.innerHTML = ''; // Limpa o body
        if (pageTransitionDivPreserved) {
            document.body.appendChild(pageTransitionDivPreserved); // Reanexa o nó de transição
        }

        const newContentWrapper = document.createElement('div');
        newContentWrapper.id = 'contentWrapper';
        newContentWrapper.className = 'content-wrapper';
        newContentWrapper.style.opacity = '0'; // Começa invisível para fade-in
        newContentWrapper.innerHTML = newBodyContent;
        document.body.appendChild(newContentWrapper);

        // Recarrega os scripts dinamicamente
        const scripts = tempDiv.querySelectorAll('script');
        const scriptPromises = [];
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src; // Mantém o src original
            } else {
                newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
        });

        // await Promise.all(scriptPromises); // Espera scripts externos se necessário

        window.history.pushState({ page: pageName }, '', `/${pageName}`); // Atualiza URL sem .html

        setTimeout(() => {
            const freshContentWrapper = document.getElementById('contentWrapper');
            if (freshContentWrapper) freshContentWrapper.style.opacity = '1';

            const pt = document.getElementById('pageTransition'); // Pega o nó de transição novamente (pode ter sido recriado)
            if (pt) pt.classList.remove('active');

            // Re-executar inicializações específicas da página se necessário, ex: tradução
            if (typeof updateLanguage === "function" && typeof translations === "object" && pageName === "index") {
                const lang = localStorage.getItem("lang") || "pt";
                updateLanguage(lang);
            }
            if (typeof rebuildForm === "function" && typeof formTranslations === "object" && pageName === "index") {
                const lang = localStorage.getItem("lang") || "pt";
                rebuildForm(lang); // Para reconstruir o formulário se estiver na página de índice e for necessário
            }
            if (pageName === 'index') {
                setupIndexCards();
            }

        }, 50);

    } catch (error) {
        // window.location.href = `/${pageName}`; // Fallback
        console.error('Erro ao carregar a página:', error);
        // Exibe erro na tela ou carrega um conteúdo de erro personalizado se quiser
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

// A função redirecionar em index.html chama esta configuração:
function redirecionar(tipo) {
    if (tipo && tipo !== '#') {
        window.navegarParaGlobal(tipo);
    } else {
        console.warn("Tentativa de redirecionar para '#' ou tipo inválido.");
    }
}

// Garante que os cards sejam configurados na carga inicial da página index.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupIndexCards);
} else {
    setupIndexCards(); // Já carregado
}

window.addEventListener('popstate', function (event) {
    if (event.state && event.state.page) {
        // window.navegarParaGlobal(event.state.page);
        window.location.reload(); // A abordagem atual de recarregar
    } else {
        window.location.reload();
    }
});

// Inicialização da página (fade-in)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const content = document.getElementById('contentWrapper');
        if (content) content.style.opacity = '1';
    }, 50);
});

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.replace('/', '');
    const paginasValidas = ['index', 'pelego', 'tecido'];

    if (paginasValidas.includes(currentPath)) {
        window.navegarParaGlobal(currentPath);
    } else {
        window.navegarParaGlobal('index');
    }

    setTimeout(() => {
        const content = document.getElementById('contentWrapper');
        if (content) content.style.opacity = '1';
    }, 50);
});