document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("form-container");
  formContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"; // Atualiza para 4 colunas em telas grandes

  const campos = [
    {
      label: "Tier",
      tipo: "select",
      id: "tier",
      options: ["T2", "T3", "T4", "T5", "T6", "T7", "T8", "Todos (BETA)"],
      values: [2, 3, 4, 5, 6, 7, 8, "all"],
      selected: 2 // Tier T2 selecionado por padrão
    },
    {
      label: "Encantamento",
      tipo: "select",
      id: "encantamento",
    },
    {
      label: "Cidade de Compra (Fibra)",
      tipo: "select",
      id: "cidadeCompra",
      options: ["Bridgewatch", "Fort Sterling", "Lymhurst", "Martlock", "Thetford", "Caerleon"]
    },
    {
      label: "Cidade de Venda (Tecido)",
      tipo: "select",
      id: "cidadeVenda",
      options: ["Bridgewatch", "Fort Sterling", "Lymhurst", "Martlock", "Thetford", "Caerleon"]
    },
    {
      label: "Quantidade",
      tipo: "number",
      id: "quantidade",
      value: "1"
    },
    {
      label: "Taxa de Imposto (Fee)",
      tipo: "number",
      id: "taxaImposto",
      value: "0"
    },
    {
      label: "Taxa de Retorno (%)",
      tipo: "number",
      id: "taxaRetorno",
      value: "53.9"
    }
  ];

  // Função para atualizar as opções de encantamento
  function atualizarEncantamentos(tier) {
    const encantamentoSelect = document.getElementById("encantamento");
    if (!encantamentoSelect) return;

    // Limpa as opções atuais
    encantamentoSelect.innerHTML = '';

    // Adiciona apenas "Sem encantamento" para T2 e T3
    if (tier === 2 || tier === 3 || tier == "all") {
      const option = document.createElement("option");
      option.value = 0;
      option.textContent = "Sem encantamento";
      option.selected = true;
      encantamentoSelect.appendChild(option);
    } else {
      // Adiciona todas as opções para outros tiers
      const options = ["Sem encantamento", "1", "2", "3", "4"];
      const values = [0, 1, 2, 3, 4];

      options.forEach((text, index) => {
        const option = document.createElement("option");
        option.value = values[index];
        option.textContent = text;
        if (index === 0) option.selected = true;
        encantamentoSelect.appendChild(option);
      });
    }
  }

  // Cria os campos do formulário
  campos.forEach(campo => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "space-y-2";

    const label = document.createElement("label");
    label.className = "block text-gray-300 font-medium";
    label.textContent = campo.label;

    let input;
    if (campo.tipo === "select") {
      input = document.createElement("select");
      input.className = "w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-white";
      input.id = campo.id;

      // Preenche as opções (exceto para encantamento que será preenchido depois)
      if (campo.id !== "encantamento") {
        campo.options.forEach((optionText, i) => {
          const option = document.createElement("option");
          option.textContent = optionText;
          option.value = campo.values ? campo.values[i] : optionText;
          if (campo.selected !== undefined && campo.values[i] === campo.selected) {
            option.selected = true;
          }
          input.appendChild(option);
        });
      }

      // Adiciona listener para o campo Tier
      if (campo.id === "tier") {
        input.addEventListener("change", (e) => {
          const selectedTier = parseInt(e.target.value);
          atualizarEncantamentos(selectedTier);
        });
      }
    } else {
      input = document.createElement("input");
      input.type = campo.tipo;
      input.className = "w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-white";
      input.id = campo.id;
      if (campo.value) input.value = campo.value;
    }

    fieldDiv.appendChild(label);
    fieldDiv.appendChild(input);
    formContainer.appendChild(fieldDiv);
  });

  // Inicializa o campo de encantamento baseado no tier selecionado inicialmente
  const tierInicial = parseInt(document.getElementById("tier").value);
  atualizarEncantamentos(tierInicial);

  // Botão de calcular único
  const buttonDiv = document.createElement("div");
  buttonDiv.className = "flex items-end"; // Alinha o botão na parte inferior

  const button = document.createElement("button");
  button.className = "w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors";
  button.innerHTML = '<i class="fas fa-calculator mr-2"></i> Calcular';
  button.onclick = () => {
    const tier = document.getElementById('tier').value;
    if (tier === "all") {
      calcularall();
    } else {
      calcular();
    }
  };

  buttonDiv.appendChild(button);

  // 7º elemento (índice 6) no array de campos
  const cidadeVendaDiv = formContainer.children[6];
  formContainer.insertBefore(buttonDiv, cidadeVendaDiv.nextSibling);
});