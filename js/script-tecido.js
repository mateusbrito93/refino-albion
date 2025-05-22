function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

function carregarImagens(tier, enc, totalFibra, totalTecidoAnterior) {
    const encSuffix = enc > 0 ? `_LEVEL${enc}_${enc}` : '';
    const imgStyle = "h-8 mr-2";

    // Para o tecido anterior: só usa encantamento se o Tier anterior for 4 ou maior
    const encSuffixTecidoAnt = (tier - 1 >= 4 && enc > 0) ? `_LEVEL${enc}_${enc}` : '';

    let html = `
        <div class="flex items-center mt-2">
            <img src="icons/T${tier}_FIBER${encSuffix}.png" class="${imgStyle}" 
                 onerror="this.src='icons/default.png'" alt="Fibra T${tier}">
            <span>${formatarValor(totalFibra)} un.</span>
        </div>
    `;

    if (tier > 2) {
        html += `
        <div class="flex items-center mt-2">
            <img src="icons/T${tier - 1}_CLOTH${encSuffixTecidoAnt}.png" class="${imgStyle}"
                 onerror="this.src='icons/default.png'" alt="Tecido T${tier - 1}">
            <span>${formatarValor(totalTecidoAnterior)} un.</span>
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

    const fibraItem = `T${tier}_FIBER${enc > 0 ? '_LEVEL' + enc + '@' + enc : ''}`; //
    const tecidoAnteriorItem = tier > 2
        ? `T${tier - 1}_CLOTH${(tier - 1 >= 4 && enc > 0) ? '_LEVEL' + enc + '@' + enc : ''}` //
        : null;

    const tecidoAtualItem = `T${tier}_CLOTH${enc > 0 ? '_LEVEL' + enc + '@' + enc : ''}`; //

    const urlFibra = `https://west.albion-online-data.com/api/v2/stats/prices/${fibraItem}.json?locations=${cidadeCompraFormatada}`; //
    const urlTecidoAnterior = tecidoAnteriorItem ?
        `https://west.albion-online-data.com/api/v2/stats/prices/${tecidoAnteriorItem}.json?locations=${cidadeCompraFormatada}` //
        : null;
    const urlTecidoAtual = `https://west.albion-online-data.com/api/v2/stats/prices/${tecidoAtualItem}.json?locations=${cidadeVendaFormatada}`; //

    try {
        iniciarBarraProgresso(); //
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
`; //
        finalizarBarraProgresso(); //

        const fetchPromises = [
            fetch(urlFibra), //
            urlTecidoAnterior ? fetch(urlTecidoAnterior) : Promise.resolve(null), //
            fetch(urlTecidoAtual) //
        ];

        const [resFibra, resTecidoAnt, resTecidoAtual] = await Promise.all(fetchPromises);

        const [dadosFibra, dadosTecidoAnt, dadosTecidoAtual] = await Promise.all([
            resFibra.json(), //
            resTecidoAnt ? resTecidoAnt.json() : Promise.resolve(null), //
            resTecidoAtual.json() //
        ]);

        const fibra = dadosFibra.find(d => d.item_id === fibraItem); //
        const tecidoAnterior = tecidoAnteriorItem ? dadosTecidoAnt?.find(d => d.item_id === tecidoAnteriorItem) : null; //
        const tecidoAtual = dadosTecidoAtual.find(d => d.item_id === tecidoAtualItem); //

        const encSuffixFibra = enc > 0 ? `_LEVEL${enc}_${enc}` : ''; //
        const encSuffixTecidoAnt = (tier - 1 >= 4 && enc > 0) ? `_LEVEL${enc}_${enc}` : ''; //
        const encSuffixTecidoAtual = enc > 0 ? `_LEVEL${enc}_${enc}` : ''; //

        if (!fibra?.sell_price_min) { //
            // ... (tratamento de erro de preço)
        }
        if (tier > 2 && !tecidoAnterior?.sell_price_min) { //
            // ... (tratamento de erro de preço)
        }
        if (!tecidoAtual?.sell_price_min) { //
            // ... (tratamento de erro de preço)
        }

        const precoFibra = fibra.sell_price_min; //
        const precoTecido = tecidoAnterior?.sell_price_min || 0; //
        const precoVenda = tecidoAtual.sell_price_min; //

        const fibrasPorTecido = { 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 5 }; //
        const tecidosAnteriores = { 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 }; //

        const totalFibra = fibrasPorTecido[tier] * quantidade; //
        const totalTecidoAnterior = tecidosAnteriores[tier] * quantidade; //
        const tecidosRetornados = quantidade * (taxaRetorno / (100 - taxaRetorno)); //
        const producaoTotal = quantidade + tecidosRetornados; //

        const imagensMateriais = carregarImagens(tier, enc, totalFibra, totalTecidoAnterior); //

        const custoFibra = totalFibra * precoFibra; //
        const custoTecidoAnterior = totalTecidoAnterior * precoTecido; //
        const custoBarraca = taxa; //
        const custoTotal = custoFibra + custoTecidoAnterior + custoBarraca; //

        const receita = producaoTotal * precoVenda; //
        const lucro = receita - custoTotal; //
        const rentabilidade = custoTotal > 0 ? ((lucro / custoTotal) * 100).toFixed(2) : "0.00"; //

        if ((tier === 2 || tier === 3) && enc > 0) { //
            document.getElementById("resultado").innerHTML = `
            <div class="bg-red-900 text-white p-4 rounded-lg">
                <p class="font-bold"><i class="fas fa-exclamation-triangle mr-2"></i>Erro</p>
                <p class="mt-2">Tecidos T${tier} não possuem encantamento!</p>
                <button onclick="calcular()" class="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-sync-alt mr-2"></i>Tentar novamente
                </button>
            </div>
        `; //
            scrollParaResultados(); //
            return;
        }

        // ... (restante da lógica de exibição de resultados da função calcular) ...
        const locaisComercioHTML = tier > 2 ? `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p><span class="font-medium">Compra Fibra:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Compra Tecido:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Venda Tecido:</span> <span class="text-green-300">${cidadeVenda}</span></p>
            </div>
        ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p><span class="font-medium">Compra Fibra:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Venda Tecido:</span> <span class="text-green-300">${cidadeVenda}</span></p>
            </div>
        `; //

        const temEncTecidoAnterior = tier - 1 >= 4 && enc > 0; //
        const encSuffixTecidoAnteriorHTML = temEncTecidoAnterior ? `_LEVEL${enc}_${enc}` : ''; //

        const tecidoAnteriorCardHTML = tier > 2 ? `
            <div class="bg-gray-700 p-4 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
                <h3 class="font-semibold mb-2 text-blue-300">Tecido T${tier - 1}${temEncTecidoAnterior ? '.' + enc : ''}</h3>
                <img src="icons/T${tier - 1}_CLOTH${encSuffixTecidoAnteriorHTML}.png" class="mx-auto h-24 mb-2" alt="Tecido Anterior">
                <p class="text-xl font-bold">$${formatarValor(precoTecido)}</p>
                <p class="text-sm text-gray-400">por unidade</p>
            </div>
        ` : ''; //

        document.getElementById("resultado").innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Resultados</h2>
            <div class="mb-6 p-4 bg-gray-700 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-3 text-yellow-400">Locais de Comércio</h3>
                ${locaisComercioHTML}
            </div>
            <div class="grid grid-cols-1 ${tier > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 mb-6">
                <div class="bg-gray-700 p-4 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
                    <h3 class="font-semibold mb-2 text-blue-300">Fibra T${tier}.${enc}</h3>
                    <img src="icons/T${tier}_FIBER${enc > 0 ? '_LEVEL' + enc + '_' + enc : ''}.png" class="mx-auto h-24 mb-2" alt="Fibra">
                    <p class="text-xl font-bold">$${formatarValor(precoFibra)}</p>
                    <p class="text-sm text-gray-400">por unidade</p>
                </div>
                ${tecidoAnteriorCardHTML}
                <div class="bg-gray-700 p-4 rounded-lg text-center shadow-lg hover:shadow-xl transition-shadow">
                    <h3 class="font-semibold mb-2 text-blue-300">Tecido T${tier}.${enc}</h3>
                    <img src="icons/T${tier}_CLOTH${enc > 0 ? '_LEVEL' + enc + '_' + enc : ''}.png" class="mx-auto h-24 mb-2" alt="Tecido Atual">
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
                            <span>Tecidos Retornados: ${Math.floor(tecidosRetornados)}</span>
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
                        <tr class="${lucro >= 0 ? "text-green-600" : "text-red-600"}">
                            <td class="p-3 font-bold">Lucro/Prejuízo</td>
                            <td class="p-3 text-right font-bold">$${formatarValor(lucro)}</td>
                        </tr>
                        <tr class="${rentabilidade >= 0 ? "text-green-600" : "text-red-600"}">
                            <td class="p-3 font-bold">Rentabilidade</td>
                            <td class="p-3 text-right font-bold">${formatarValor(rentabilidade)}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `; //
        finalizarBarraProgresso(); //
        scrollParaResultados(); //

    } catch (err) {
        console.error("Erro detalhado:", {
            cidades: { compra: cidadeCompra, venda: cidadeVenda },
            urls: { urlFibra, urlTecidoAnterior, urlTecidoAtual }, //
            error: err.message
        });

        document.getElementById("resultado").innerHTML = `
            <div class="bg-red-900 text-white p-4 rounded-lg">
                <p class="font-bold"><i class="fas fa-exclamation-triangle mr-2"></i>Erro ao calcular</p>
                <p class="mt-2">${err.message}</p>
                <p class="mt-2 text-sm">Itens buscados:</p>
                <ul class="text-sm mt-1">
                    <li>${fibraItem}</li>
                    ${tecidoAnteriorItem ? `<li>${tecidoAnteriorItem}</li>` : ''}
                    <li>${tecidoAtualItem}</li>
                </ul>
                <button onclick="calcular()" class="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-sync-alt mr-2"></i>Tentar novamente
                </button>
            </div>
        `; //
        scrollParaResultados(); //
    }
}

async function calcularall() {
    const cidadeCompra = document.getElementById('cidadeCompra').value;
    const cidadeVenda = document.getElementById('cidadeVenda').value;
    const tierSelecionado = document.getElementById('tier').value;
    const enc = parseInt(document.getElementById('encantamento').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const taxa = parseFloat(document.getElementById('taxaImposto').value);
    const taxaRetorno = parseFloat(document.getElementById('taxaRetorno').value);

    const cidadeCompraFormatada = cidadeCompra.toLowerCase().replace(/\s/g, '');
    const cidadeVendaFormatada = cidadeVenda.toLowerCase().replace(/\s/g, '');

    const resultadoDiv = document.getElementById("resultado"); //
    resultadoDiv.innerHTML = '<p class="text-center text-gray-300">Calculando...</p>'; //
    iniciarBarraProgresso(); //

    const tiersParaCalcular = tierSelecionado === "all" ? [2, 3, 4, 5, 6, 7, 8] : [parseInt(tierSelecionado)]; //

    let resultadosHTML = `
        <h2 class="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Resultados - ${tierSelecionado === "all" ? "Todos os Tiers" : `Tier ${tierSelecionado}`}</h2>
        <div class="mb-6 p-4 bg-gray-700 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-3 text-yellow-400">Locais de Comércio</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p><span class="font-medium">Compra Fibra:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Compra Tecido:</span> <span class="text-yellow-300">${cidadeCompra}</span></p>
                <p><span class="font-medium">Venda Tecido:</span> <span class="text-green-300">${cidadeVenda}</span></p>
            </div>
        </div>
        <div class="overflow-x-auto">
        <table class="table-auto w-full text-sm text-white border border-gray-700 rounded-lg">
            <thead class="bg-gray-800 text-xs uppercase">
                <tr>
                    <th class="px-4 py-2 text-left">Tier</th>
                    <th class="px-4 py-2">Fibra</th>
                    <th class="px-4 py-2">Tecido Anterior</th>
                    <th class="px-4 py-2">Tecido Refinado</th>
                    <th class="px-4 py-2">Materiais</th>
                    <th class="px-4 py-2">Retorno</th>
                    <th class="px-4 py-2">Produção</th>
                    <th class="px-4 py-2">Custo</th>
                    <th class="px-4 py-2">Receita</th>
                    <th class="px-4 py-2">Lucro</th>
                    <th class="px-4 py-2">Rentabilidade</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
    `; //

    for (let tier of tiersParaCalcular) {
        const fibraItem = `T${tier}_FIBER${enc > 0 ? '_LEVEL' + enc + '@' + enc : ''}`; //
        const tecidoAnteriorItem = tier > 2 ? `T${tier - 1}_CLOTH${(tier - 1 >= 4 && enc > 0) ? '_LEVEL' + enc + '@' + enc : ''}` : null; //
        const tecidoAtualItem = `T${tier}_CLOTH${enc > 0 ? '_LEVEL' + enc + '@' + enc : ''}`; //

        const urlFibra = `https://west.albion-online-data.com/api/v2/stats/prices/${fibraItem}.json?locations=${cidadeCompraFormatada}`; //
        const urlTecidoAnterior = tecidoAnteriorItem ? `https://west.albion-online-data.com/api/v2/stats/prices/${tecidoAnteriorItem}.json?locations=${cidadeCompraFormatada}` : null; //
        const urlTecidoAtual = `https://west.albion-online-data.com/api/v2/stats/prices/${tecidoAtualItem}.json?locations=${cidadeVendaFormatada}`; //

        const [resFibra, resTecidoAnt, resTecidoAtual] = await Promise.all([
            fetch(urlFibra), //
            urlTecidoAnterior ? fetch(urlTecidoAnterior) : Promise.resolve(null), //
            fetch(urlTecidoAtual) //
        ]);

        const [dadosFibra, dadosTecidoAnt, dadosTecidoAtual] = await Promise.all([
            resFibra.json(), //
            resTecidoAnt ? resTecidoAnt.json() : Promise.resolve(null), //
            resTecidoAtual.json() //
        ]);

        const fibra = dadosFibra.find(d => d.item_id === fibraItem); //
        const tecidoAnterior = tecidoAnteriorItem ? dadosTecidoAnt?.find(d => d.item_id === tecidoAnteriorItem) : null; //
        const tecidoAtual = dadosTecidoAtual.find(d => d.item_id === tecidoAtualItem); //

        if (!fibra?.sell_price_min || !tecidoAtual?.sell_price_min || (tier > 2 && !tecidoAnterior?.sell_price_min)) continue; //

        const precoFibra = fibra.sell_price_min; //
        const precoTecido = tecidoAnterior?.sell_price_min || 0; //
        const precoVenda = tecidoAtual.sell_price_min; //

        const fibrasPorTecido = { 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 5 }; //
        const tecidosAnteriores = { 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 }; //

        const totalFibra = fibrasPorTecido[tier] * quantidade; //
        const totalTecidoAnterior = tecidosAnteriores[tier] * quantidade; //
        const tecidosRetornados = quantidade * (taxaRetorno / (100 - taxaRetorno)); //
        const producaoTotal = quantidade + tecidosRetornados; //

        const custoFibra = totalFibra * precoFibra; //
        const custoTecidoAnterior = totalTecidoAnterior * precoTecido; //
        const custoTotal = custoFibra + custoTecidoAnterior + taxa; //

        const receita = producaoTotal * precoVenda; //
        const lucro = receita - custoTotal; //
        const rentabilidade = custoTotal > 0 ? ((lucro / custoTotal) * 100).toFixed(2) : "0.00"; //

        resultadosHTML += `
        <tr>
            <td class="px-4 py-2 font-bold">T${tier}</td>
            <td class="px-4 py-2">${totalFibra} x $${formatarValor(precoFibra)}</td>
            <td class="px-4 py-2">${tier > 2 ? totalTecidoAnterior + ' x $' + formatarValor(precoTecido) : '-'}</td>
            <td class="px-4 py-2">${quantidade} x $${formatarValor(precoVenda)}</td>
            <td class="px-4 py-2">${totalFibra + (tier > 2 ? totalTecidoAnterior : 0)}</td>
            <td class="px-4 py-2">${Math.floor(tecidosRetornados)}</td>
            <td class="px-4 py-2">${producaoTotal.toFixed(2)}</td>
            <td class="px-4 py-2">$${formatarValor(custoTotal)}</td>
            <td class="px-4 py-2">$${formatarValor(receita)}</td>
            <td class="px-4 py-2 ${lucro >= 0 ? 'text-green-500' : 'text-red-500'}">$${formatarValor(lucro)}</td>
            <td class="px-4 py-2 ${rentabilidade >= 0 ? 'text-green-500' : 'text-red-500'}">${rentabilidade}%</td>
        </tr>
        `; //
    }

    resultadosHTML += `</tbody></table></div>`; //
    finalizarBarraProgresso(); //
    resultadoDiv.innerHTML = resultadosHTML; //
    scrollParaResultados(); //
}


function scrollParaResultados() {
    const elementoResultados = document.getElementById("resultado"); //
    if (elementoResultados) {
        elementoResultados.scrollIntoView({
            behavior: 'smooth', //
            block: 'start' //
        });

        elementoResultados.style.transition = 'box-shadow 0.5s'; //
        elementoResultados.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)'; //

        setTimeout(() => {
            elementoResultados.style.boxShadow = 'none'; //
        }, 1000);
    }
}

function iniciarBarraProgresso() {
    const barra = document.getElementById("barra-progresso"); //
    if (barra) {
        barra.style.width = "40%"; //
        setTimeout(() => barra.style.width = "80%", 300); //
    }
}

function finalizarBarraProgresso() {
    const barra = document.getElementById("barra-progresso"); //
    if (barra) {
        barra.style.width = "100%"; //
        setTimeout(() => {
            barra.style.opacity = "0"; //
            setTimeout(() => {
                barra.style.width = "0"; //
                barra.style.opacity = "1"; //
            }, 400);
        }, 300);
    }
}

// Função para o botão "Voltar" ou navegação para o índice
function irParaIndex() {
    if (window.navegarParaGlobal) {
        window.navegarParaGlobal('index');
    } else {
        console.error("Função de navegação global não encontrada. Recorrendo ao link direto.");
        window.location.href = '/index'; // Fallback, depende do .htaccess
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Animação de entrada do conteúdo
    setTimeout(() => {
        const contentWrapper = document.getElementById('contentWrapper');
        if (contentWrapper) {
            contentWrapper.style.opacity = '1'; //
        }
    }, 50);

    // Inicialização do Tema
    const toggleDiv = document.getElementById("toggle-theme"); //
    const themeIcon = document.getElementById("theme-icon"); //
    const html = document.documentElement; //

    function aplicarTemaClaro() {
        html.classList.add("light"); //
        themeIcon.classList.remove("fa-moon"); //
        themeIcon.classList.add("fa-sun"); //
        localStorage.setItem("tema", "claro"); //
    }

    function aplicarTemaEscuro() {
        html.classList.remove("light"); //
        themeIcon.classList.remove("fa-sun"); //
        themeIcon.classList.add("fa-moon"); //
        localStorage.setItem("tema", "escuro"); //
    }

    if (toggleDiv) { // Verifica se o elemento existe antes de adicionar o listener
        toggleDiv.addEventListener("click", () => {
            if (html.classList.contains("light")) { //
                aplicarTemaEscuro(); //
            } else {
                aplicarTemaClaro(); //
            }
        });
    }

    const temaSalvo = localStorage.getItem("tema"); //
    if (temaSalvo === "claro") { //
        aplicarTemaClaro(); //
    } else {
        aplicarTemaEscuro(); // padrão //
    }
});

// Listener para o evento popstate do navegador (voltar/avançar)
window.addEventListener('popstate', function () {
    window.location.reload(); //
});