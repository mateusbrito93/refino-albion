function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

function carregarImagens(tier, enc, totalPelego, totalCouroAnterior) {
    const encSuffix = enc > 0 ? `_LEVEL${enc}_${enc}` : '';
    const imgStyle = "h-8 mr-2";

    // Para o couro anterior: só usa encantamento se o Tier anterior for 4 ou maior
    const encSuffixCouroAnt = (tier - 1 >= 4 && enc > 0) ? `_LEVEL${enc}_${enc}` : '';

    let html = `
        <div class="flex items-center mt-2">
            <img src="icons/T${tier}_HIDE${encSuffix}.png" class="${imgStyle}" 
                 onerror="this.src='icons/default.png'" alt="Pelego T${tier}">
            <span>${formatarValor(totalPelego)} un.</span>
        </div>
    `;

    if (tier > 2) {
        html += `
        <div class="flex items-center mt-2">
            <img src="icons/T${tier - 1}_LEATHER${encSuffixCouroAnt}.png" class="${imgStyle}"
                 onerror="this.src='icons/default.png'" alt="Couro T${tier - 1}">
            <span>${formatarValor(totalCouroAnterior)} un.</span>
        </div>
        `;
    }

    return html;
}


async function calcular() {
    const cidadeCompra = document.getElementById('cidadeCompra').value;
    const cidadeVenda = document.getElementById('cidadeVenda').value;
    const tier = parseInt(document.getElementById('tier').value);
    const enc = parseInt(document.getElementById('encantamento').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const taxa = parseFloat(document.getElementById('taxaImposto').value);
    const taxaRetorno = parseFloat(document.getElementById('taxaRetorno').value);

    const cidadeCompraFormatada = cidadeCompra.toLowerCase().replace(/\s/g, '');
    const cidadeVendaFormatada = cidadeVenda.toLowerCase().replace(/\s/g, '');

    const sufixo = enc > 0 ? `@${enc}` : "";
    const pelegoItem = `T${tier}_HIDE${enc > 0 ? '_LEVEL' + enc + '@' + enc : ''}`;
    const couroAnteriorItem = tier > 2
        ? `T${tier - 1}_LEATHER${(tier - 1 >= 4 && enc > 0) ? '_LEVEL' + enc + '@' + enc : ''}`
        : null;

    const couroAtualItem = `T${tier}_LEATHER${enc > 0 ? '_LEVEL' + enc + '@' + enc : ''}`;

    const urlPelego = `https://west.albion-online-data.com/api/v2/stats/prices/${pelegoItem}.json?locations=${cidadeCompraFormatada}`;
    const urlCouroAnterior = couroAnteriorItem ?
        `https://west.albion-online-data.com/api/v2/stats/prices/${couroAnteriorItem}.json?locations=${cidadeCompraFormatada}` :
        null;
    const urlCouroAtual = `https://west.albion-online-data.com/api/v2/stats/prices/${couroAtualItem}.json?locations=${cidadeVendaFormatada}`;

    try {
        iniciarBarraProgresso();
        document.getElementById("resultado").innerHTML = `
            <div class="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-700 rounded-lg p-6 space-y-4">
                    <div class="h-6 bg-gray-600 rounded w-1/2"></div>
                    <div class="h-24 bg-gray-600 rounded"></div>
                    <div class="h-4 bg-gray-600 rounded w-1/3"></div>
                </div>
                <div class="bg-gray-700 rounded-lg p-6 space-y-4">
                    <div class="h-6 bg-gray-600 rounded w-1/2"></div>
                    <div class="h-24 bg-gray-600 rounded"></div>
                    <div class="h-4 bg-gray-600 rounded w-1/3"></div>
                </div>
                <div class="bg-gray-700 rounded-lg p-6 space-y-4">
                    <div class="h-6 bg-gray-600 rounded w-1/2"></div>
                    <div class="h-24 bg-gray-600 rounded"></div>
                    <div class="h-4 bg-gray-600 rounded w-1/3"></div>
                </div>
            </div>
        <p class="text-center mt-6 text-gray-400">Buscando preços atualizados...</p>
`;
        finalizarBarraProgresso();

        // Modificado para lidar com T2 (sem couro anterior)
        const fetchPromises = [
            fetch(urlPelego),
            urlCouroAnterior ? fetch(urlCouroAnterior) : Promise.resolve(null),
            fetch(urlCouroAtual)
        ];

        const [resPelego, resCouroAnt, resCouroAtual] = await Promise.all(fetchPromises);

        const [dadosPelego, dadosCouroAnt, dadosCouroAtual] = await Promise.all([
            resPelego.json(),
            resCouroAnt ? resCouroAnt.json() : Promise.resolve(null),
            resCouroAtual.json()
        ]);

        const pelego = dadosPelego.find(d => d.item_id === pelegoItem);
        const couroAnterior = couroAnteriorItem ? dadosCouroAnt?.find(d => d.item_id === couroAnteriorItem) : null;
        const couroAtual = dadosCouroAtual.find(d => d.item_id === couroAtualItem);

        let mensagensErro = [];

        const encSuffixPelego = enc > 0 ? `_LEVEL${enc}_${enc}` : '';
        const encSuffixCouroAnt = (tier - 1 >= 4 && enc > 0) ? `_LEVEL${enc}_${enc}` : '';
        const encSuffixCouroAtual = enc > 0 ? `_LEVEL${enc}_${enc}` : '';

        if (!pelego?.sell_price_min) {
            mensagensErro.push(`
        <div class="flex items-center gap-3">
            <img src="icons/T${tier}_HIDE${encSuffixPelego}.png" alt="Pelego" class="h-8 w-8">
            <span>Preço não encontrado para <strong>${pelegoItem}</strong> em ${cidadeCompra}</span>
        </div>
    `);
        }
        if (tier > 2 && !couroAnterior?.sell_price_min) {
            mensagensErro.push(`
        <div class="flex items-center gap-3">
            <img src="icons/T${tier - 1}_LEATHER${encSuffixCouroAnt}.png" alt="Couro Anterior" class="h-8 w-8">
            <span>Preço não encontrado para <strong>${couroAnteriorItem}</strong> em ${cidadeCompra}</span>
        </div>
    `);
        }
        if (!couroAtual?.sell_price_min) {
            mensagensErro.push(`
        <div class="flex items-center gap-3">
            <img src="icons/T${tier}_LEATHER${encSuffixCouroAtual}.png" alt="Couro Atual" class="h-8 w-8">
            <span>Preço não encontrado para <strong>${couroAtualItem}</strong> em ${cidadeVenda}</span>
        </div>
    `);
        }



        const precoPelego = pelego.sell_price_min;
        const precoCouro = couroAnterior?.sell_price_min || 0; // 0 para T2
        const precoVenda = couroAtual.sell_price_min;

        const pelegosPorCouro = { 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 5 };
        const courosAnteriores = { 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 };

        const totalPelego = pelegosPorCouro[tier] * quantidade;
        const totalCouroAnterior = courosAnteriores[tier] * quantidade;
        const courosRetornados = quantidade * (taxaRetorno / (100 - taxaRetorno));
        const producaoTotal = quantidade + courosRetornados;

        const imagensMateriais = carregarImagens(tier, enc, totalPelego, totalCouroAnterior);

        const custoPelego = totalPelego * precoPelego;
        const custoCouroAnterior = totalCouroAnterior * precoCouro;
        const custoBarraca = taxa;
        const custoTotal = custoPelego + custoCouroAnterior + custoBarraca;

        const receita = producaoTotal * precoVenda;
        const lucro = receita - custoTotal;
        const rentabilidade = custoTotal > 0 ? ((lucro / custoTotal) * 100).toFixed(2) : "0.00";

        const corLucro = lucro >= 0 ? "text-green-600" : "text-red-600";
        const corLucro2 = rentabilidade >= 0 ? "text-green-600" : "text-red-600";

        // Validação adicional para T2 e T3
        if ((tier === 2 || tier === 3) && enc > 0) {
            document.getElementById("resultado").innerHTML = `
            <div class="bg-red-900 text-white p-4 rounded-lg">
                <p class="font-bold"><i class="fas fa-exclamation-triangle mr-2"></i>Erro</p>
                <p class="mt-2">Couros T${tier} não possuem encantamento!</p>
                <button onclick="calcular()" class="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-sync-alt mr-2"></i>Tentar novamente
                </button>
            </div>
        `;
            scrollParaResultados();
            return;
        }

        // Modificar a exibição para T2
        const locaisComercioHTML = tier > 2 ? `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p><span class="font-medium">Compra Pelego:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Compra Couro:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Venda Couro:</span> <span class="text-green-300">${cidadeVenda}</span></p>
            </div>
        ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p><span class="font-medium">Compra Pelego:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Venda Couro:</span> <span class="text-green-300">${cidadeVenda}</span></p>
            </div>
        `;

        const temEncCouroAnterior = tier - 1 >= 4 && enc > 0;
        const encSuffixCouroAnterior = temEncCouroAnterior ? `_LEVEL${enc}_${enc}` : '';

        const couroAnteriorCardHTML = tier > 2 ? `
            <div class="bg-gray-700 p-4 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
                <h3 class="font-semibold mb-2 text-blue-300">Couro T${tier - 1}${temEncCouroAnterior ? '.' + enc : ''}</h3>
                <img src="icons/T${tier - 1}_LEATHER${encSuffixCouroAnterior}.png" class="mx-auto h-24 mb-2" alt="Couro Anterior">
                <p class="text-xl font-bold">$${formatarValor(precoCouro)}</p>
                <p class="text-sm text-gray-400">por unidade</p>
            </div>
        ` : '';


        document.getElementById("resultado").innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Resultados</h2>
            
            <div class="mb-6 p-4 bg-gray-700 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-3 text-yellow-400">Locais de Comércio</h3>
                ${locaisComercioHTML}
            </div>

            <div class="grid grid-cols-1 ${tier > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 mb-6">
                <div class="bg-gray-700 p-4 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
                    <h3 class="font-semibold mb-2 text-blue-300">Pelego T${tier}.${enc}</h3>
                    <img src="icons/T${tier}_HIDE${enc > 0 ? '_LEVEL' + enc + '_' + enc : ''}.png" class="mx-auto h-24 mb-2" alt="Pelego">
                    <p class="text-xl font-bold">$${formatarValor(precoPelego)}</p>
                    <p class="text-sm text-gray-400">por unidade</p>
                </div>
                ${couroAnteriorCardHTML}
                <div class="bg-gray-700 p-4 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
                    <h3 class="font-semibold mb-2 text-blue-300">Couro T${tier}.${enc}</h3>
                    <img src="icons/T${tier}_LEATHER${enc > 0 ? '_LEVEL' + enc + '_' + enc : ''}.png" class="mx-auto h-24 mb-2" alt="Couro Atual">
                    <p class="text-xl font-bold">$${formatarValor(precoVenda)}</p>
                    <p class="text-sm text-gray-400">por unidade</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-700 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-3 text-blue-300 border-b border-gray-600 pb-2">Materiais Necessários</h3>
                    <div class="space-y-2">
                        ${imagensMateriais}
                        <div class="pt-2 mt-2 border-t border-gray-600">
                            <i class="fas fa-reply mr-2 text-purple-300"></i>
                            <span>Couros Retornados: ${Math.floor(courosRetornados)}</span>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-700 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-3 text-blue-300 border-b border-gray-600 pb-2">Produção</h3>
                    <div class="space-y-2">
                        <p><span class="font-medium">Total:</span> <span class="text-xl font-bold">${producaoTotal.toFixed(2)}</span></p>
                        <p><span class="font-medium">Taxa de Imposto (Fee):</span> $${formatarValor(custoBarraca)}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                <table class="w-full">
                    <thead class="bg-gray-600">
                        <tr>
                            <th class="p-3 text-left font-semibold">Descrição</th>
                            <th class="p-3 text-right font-semibold">Valor</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-600">
                        <tr>
                            <td class="p-3">Custo Total</td>
                            <td class="p-3 text-right">$${formatarValor(custoTotal)}</td>
                        </tr>
                        <tr>
                            <td class="p-3">Receita Total</td>
                            <td class="p-3 text-right">$${formatarValor(receita)}</td>
                        </tr>
                        <tr class="${corLucro}">
                            <td class="p-3 font-bold">Lucro/Prejuízo</td>
                            <td class="p-3 text-right font-bold">$${formatarValor(lucro)}</td>
                        </tr>
                        <tr class="${corLucro2}">
                            <td class="p-3 font-bold">Rentabilidade</td>
                            <td class="p-3 text-right font-bold">${formatarValor(rentabilidade)}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        finalizarBarraProgresso();
        scrollParaResultados();

    } catch (err) {
        console.error("Erro detalhado:", {
            cidades: { compra: cidadeCompra, venda: cidadeVenda },
            urls: { urlPelego, urlCouroAnterior, urlCouroAtual },
            error: err.message
        });

        document.getElementById("resultado").innerHTML = `
            <div class="bg-red-900 text-white p-4 rounded-lg">
                <p class="font-bold"><i class="fas fa-exclamation-triangle mr-2"></i>Erro ao calcular</p>
                <p class="mt-2">${err.message}</p>
                <p class="mt-2 text-sm">Itens buscados:</p>
                <ul class="text-sm mt-1">
                    <li>${pelegoItem}</li>
                    ${couroAnteriorItem ? `<li>${couroAnteriorItem}</li>` : ''}
                    <li>${couroAtualItem}</li>
                </ul>
                <button onclick="calcular()" class="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-sync-alt mr-2"></i>Tentar novamente
                </button>
            </div>
        `;
        scrollParaResultados();
    }
}

function scrollParaResultados() {
    const elementoResultados = document.getElementById("resultado");
    if (elementoResultados) {
        elementoResultados.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        elementoResultados.style.transition = 'box-shadow 0.5s';
        elementoResultados.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';

        setTimeout(() => {
            elementoResultados.style.boxShadow = 'none';
        }, 1000);
    }
}

function iniciarBarraProgresso() {
    const barra = document.getElementById("barra-progresso");
    if (barra) {
        barra.style.width = "40%";
        setTimeout(() => barra.style.width = "80%", 300);
    }
}

function finalizarBarraProgresso() {
    const barra = document.getElementById("barra-progresso");
    if (barra) {
        barra.style.width = "100%";
        setTimeout(() => {
            barra.style.opacity = "0";
            setTimeout(() => {
                barra.style.width = "0";
                barra.style.opacity = "1";
            }, 400);
        }, 300);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const toggleDiv = document.getElementById("toggle-theme");
    const themeIcon = document.getElementById("theme-icon");
    const html = document.documentElement;

    function aplicarTemaClaro() {
        html.classList.add("light");
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
        localStorage.setItem("tema", "claro");
    }

    function aplicarTemaEscuro() {
        html.classList.remove("light");
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
        localStorage.setItem("tema", "escuro");
    }

    toggleDiv.addEventListener("click", () => {
        if (html.classList.contains("light")) {
            aplicarTemaEscuro();
        } else {
            aplicarTemaClaro();
        }
    });

    // Carrega preferência
    const temaSalvo = localStorage.getItem("tema");
    if (temaSalvo === "claro") {
        aplicarTemaClaro();
    } else {
        aplicarTemaEscuro(); // padrão
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Anima a entrada do conteúdo
    setTimeout(() => {
        document.getElementById('contentWrapper').style.opacity = '1';
    }, 50);

    // Modifique todos os links para usar o sistema de transição
    document.querySelectorAll('a[href]').forEach(link => {
        if (link.href.includes('.html') && !link.target) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('href').replace('.html', '');
                redirecionar(page);
            });
        }
    });
});

// Função para inicializar a página
function inicializarPagina() {
    // Inicializa todos os componentes necessários
    const content = document.getElementById('contentWrapper');
    if (content) content.style.opacity = '1';

    // Configura o botão voltar
    const btnVoltar = document.querySelector('button[onclick*="index.html"]');
    if (btnVoltar) {
        btnVoltar.onclick = (e) => {
            e.preventDefault();
            navegarPara('index.html');
        };
    }

    // Inicializa outros componentes da página conforme necessário
    if (typeof iniciarBarraProgresso === 'function') {
        iniciarBarraProgresso();
    }
    if (typeof calcular === 'function') {
        // Inicializa a calculadora se necessário
    }
}

// Se a página foi carregada diretamente
if (!window.history.state || window.history.state.directLoad) {
    document.addEventListener('DOMContentLoaded', inicializarPagina);
} else {
    // Se foi carregada via SPA
    inicializarPagina();
}

// Função de navegação compatível com o index
async function navegarPara(url) {
    const transition = document.getElementById('pageTransition');
    const content = document.getElementById('contentWrapper');

    if (content) content.style.opacity = '0';
    if (transition) transition.classList.add('active');

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (url === 'index.html') {
            window.location.href = url;
        } else {
            const response = await fetch(url);
            const html = await response.text();
            document.body.innerHTML = html;
            window.history.pushState({}, '', url);
        }
    } catch (error) {
        console.error('Erro na navegação:', error);
        window.location.href = url;
    }
}

// Evento para o botão voltar
document.addEventListener('DOMContentLoaded', () => {
    // Garante que o conteúdo fique visível ao carregar
    setTimeout(() => {
        const content = document.getElementById('contentWrapper');
        if (content) content.style.opacity = '1';
    }, 50);

    // Configura o botão voltar
    const btnVoltar = document.querySelector('button[onclick="navegarPara(\'index.html\')"]');
    if (btnVoltar) {
        btnVoltar.onclick = () => navegarPara('index.html');
    }
});

// Função específica para voltar à home
function voltarParaHome() {
    navegarPara('index.html');
}

// Atualize o evento popstate
window.addEventListener('popstate', function () {
    window.location.reload();
});