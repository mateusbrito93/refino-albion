function buildFormWithLang(t) {
  const formContainer = document.getElementById("form-container");
  if (!formContainer) return;
  formContainer.innerHTML = "";
  formContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";

  const campos = [
    {
      label: t.tier,
      tipo: "select",
      id: "tier",
      options: ["T2", "T3", "T4", "T5", "T6", "T7", "T8", "Todos (BETA)"],
      values: [2, 3, 4, 5, 6, 7, 8, "all"],
      selected: 2
    },
    {
      label: t.encantamento,
      tipo: "select",
      id: "encantamento",
    },
    {
      label: t.cidadeCompra,
      tipo: "select",
      id: "cidadeCompra",
      options: ["Bridgewatch", "Fort Sterling", "Lymhurst", "Martlock", "Thetford", "Caerleon", "Brecilien"]
    },
    {
      label: t.cidadeVenda,
      tipo: "select",
      id: "cidadeVenda",
      options: ["Bridgewatch", "Fort Sterling", "Lymhurst", "Martlock", "Thetford", "Caerleon", "Brecilien"]
    },
    {
      label: t.quantidade,
      tipo: "number",
      id: "quantidade",
      value: "1"
    },
    {
      label: t.taxaImposto,
      tipo: "number",
      id: "taxaImposto",
      value: "0"
    },
    {
      label: t.taxaRetorno,
      tipo: "number",
      id: "taxaRetorno",
      value: "53.9"
    }
  ];

  function atualizarEncantamentos(tier) {
    const encantamentoSelect = document.getElementById("encantamento");
    if (!encantamentoSelect) return;
    encantamentoSelect.innerHTML = '';

    if (tier === 2 || tier === 3 || tier == "all") {
      const option = document.createElement("option");
      option.value = 0;
      option.textContent = "0";
      option.selected = true;
      encantamentoSelect.appendChild(option);
    } else {
      const options = ["0", "1", "2", "3", "4"];
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

  const tierInicial = parseInt(document.getElementById("tier").value);
  atualizarEncantamentos(tierInicial);

  const buttonDiv = document.createElement("div");
  buttonDiv.className = "flex items-end";

  const button = document.createElement("button");
  button.className = "w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors";
  button.innerHTML = '<i class="fas fa-calculator mr-2"></i>' + t.calcular;
  button.onclick = () => {
    const tier = document.getElementById('tier').value;
    if (tier === "all") {
      calcularall();
    } else {
      calcular();
    }
  };

  buttonDiv.appendChild(button);

  const cidadeVendaDiv = formContainer.children[6];
  formContainer.insertBefore(buttonDiv, cidadeVendaDiv.nextSibling);
}

document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "pt";
  if (typeof buildFormWithLang === "function" && typeof formTranslations === "object") {
    buildFormWithLang(formTranslations[lang]);
  }
});