const translations = {
    pt: {
        title: "Refino Albion",
        titulo: "Selecione o Tipo de Refino",
        titulopelego: "Calculadora de Refino - Pelegos",
        titulotecido: "Calculadora de Refino - Fibras",
        minerio: "Refino de Minério",
        pelego: "Refino de Pelego",
        tecido: "Refino de Tecido",
        madeira: "Refino de Madeira",
        pedra: "Refino de Pedra",
        outros: "Outros Refinos",
        mineriodesc: "Calculadora para refino de metais e barras",
        pelegodesc: "Calculadora para refino de couros e pelegos",
        tecidodesc: "Calculadora para refino de fibras e tecidos",
        madeiradesc: "Calculadora para refino de madeiras e tábuas",
        pedradesc: "Calculadora para refino de pedras e blocos",
        outrosdesc: "Calculadora para outros refinos",
        copyright: "© 2025 Calculadora de Refino - Albion Online. Todos os direitos reservados."
    },
    en: {
        title: "Albion Refinement",
        titulo: "Select Refining Type",
        titulopelego: "Refining Calculator - Leathers",
        titulotecido: "Refining Calculator - Fibers",
        minerio: "Ore Refining",
        pelego: "Leather Refining",
        tecido: "Cloth Refining",
        madeira: "Wood Refining",
        pedra: "Stone Refining",
        outros: "Other Refinements",
        mineriodesc: "Calculator for refining metals and bars",
        pelegodesc: "Calculator for refining leather and hides",
        tecidodesc: "Calculator for refining fibers and clothes",
        madeiradesc: "Calculator for refining wood and boards",
        pedradesc: "Calculator for stone and blocks",
        outrosdesc: "Other Refinements",
        copyright: "© 2025 Refining Calculator - Albion Online. All rights reserved."
    },
    es: {
        title: "Refinamiento de Albion",
        titulo: "Seleccionar el tipo de refinación",
        titulopelego: "Calculadora de refinación - Cuero",
        titulotecido: "Calculadora de refinación - Fibras",
        minerio: "Refinación de minerales",
        pelego: "Refinación del cuero",
        tecido: "Refinación de tejidos",
        madeira: "Refinación de madera",
        pedra: "Refinación de piedras",
        outros: "Otros refinamientos",
        mineriodesc: "Calculadora para refinar metales y barras",
        pelegodesc: "Calculadora para refinar cueros y pieles",
        tecidodesc: "Calculadora para refinar fibras y tejidos",
        madeiradesc: "Calculadora para refinar madera y tableros",
        pedradesc: "Calculadora de refinación de piedras y bloques",
        outrosdesc: "Otros refinamientos",
        copyright: "© 2025 Calculadora de refinación - Albion Online. Reservados todos los derechos."
    }
};

const langButtons = document.querySelectorAll(".language-selector img");
const title = document.getElementById("title");
const titulo = document.getElementById("titulo");
const titulopelego = document.getElementById("titulopelego");
const titulotecido = document.getElementById("titulotecido");
const minerio = document.getElementById("minerio");
const pelego = document.getElementById("pelego");
const tecido = document.getElementById("tecido");
const madeira = document.getElementById("madeira");
const pedra = document.getElementById("pedra");
const outros = document.getElementById("outros");
const mineriodesc = document.getElementById("mineriodesc");
const pelegodesc = document.getElementById("pelegodesc");
const tecidodesc = document.getElementById("tecidodesc");
const madeiradesc = document.getElementById("madeiradesc");
const pedradesc = document.getElementById("pedradesc");
const outrosdesc = document.getElementById("outrosdesc");
const copyright = document.getElementById("copyright");

// Função para trocar idioma
function updateLanguage(lang) {
  const translation = translations[lang];
  if (!translation) {
    console.error(`Idioma '${lang}' não encontrado nas traduções.`);
    return;
  }

  if (title) title.textContent = translation.title;
  if (titulo) titulo.textContent = translation.titulo;
  if (titulopelego) titulopelego.textContent = translation.titulopelego;
  if (titulotecido) titulotecido.textContent = translation.titulotecido;
  if (minerio) minerio.textContent = translation.minerio;
  if (pelego) pelego.textContent = translation.pelego;
  if (tecido) tecido.textContent = translation.tecido;
  if (madeira) madeira.textContent = translation.madeira;
  if (pedra) pedra.textContent = translation.pedra;
  if (outros) outros.textContent = translation.outros;
  if (mineriodesc) mineriodesc.textContent = translation.mineriodesc;
  if (pelegodesc) pelegodesc.textContent = translation.pelegodesc;
  if (tecidodesc) tecidodesc.textContent = translation.tecidodesc;
  if (madeiradesc) madeiradesc.textContent = translation.madeiradesc;
  if (pedradesc) pedradesc.textContent = translation.pedradesc;
  if (outrosdesc) outrosdesc.textContent = translation.outrosdesc;
  if (copyright) copyright.textContent = translation.copyright;
}

function rebuildForm(lang = 'pt') {
  if (typeof buildFormWithLang === 'function') {
    buildFormWithLang(formTranslations[lang]);
  }
}

// Evento de clique nas bandeiras
langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const selectedLang = btn.getAttribute("data-lang");
        updateLanguage(selectedLang);
    });
});

// Idioma padrão
updateLanguage("pt");

// Atualizar formulário ao trocar idioma
langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const selectedLang = btn.getAttribute("data-lang");
        localStorage.setItem("lang", selectedLang); // <- salva o idioma
        updateLanguage(selectedLang);
        rebuildForm(selectedLang);
    });
});

// Chamada inicial para reconstruir formulário com idioma padrão
rebuildForm("pt");
