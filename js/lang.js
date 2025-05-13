const translations = {
    pt: {
        title: "Refino Albion",
        titulo: "Selecione o Tipo de Refino",
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
        minerio: "Ore Refining",
        pelego: "Leather Refining",
        tecido: "Cloth Refining",
        madeira: "Wood Refining",
        pedra: "Stone Refining",
        outros: "Other Refinements",
        mineriodesc: "Calculator for refining metals and bars",
        pelegodesc: "Calculator for refining leather and hides",
        tecidodesc: "Refino de Tecido",
        madeiradesc: "Refino de Madeira",
        pedradesc: "Refino de Pedra",
        outrosdesc: "Outros Refinos",
        copyright: "© 2025 Refining Calculator - Albion Online. All rights reserved."
    },
    es: {
        title: "Refinamiento de Albion",
        titulo: "Seleccionar el tipo de refinación",
        minerio: "Refinación de minerales",
        pelego: "Refinación del cuero",
        tecido: "Refinación de tejidos",
        madeira: "Refinación de madera",
        pedra: "Refinación de piedras",
        outros: "Otros refinamientos",
        mineriodesc: "Calculadora para refinar metales y barras",
        pelegodesc: "Calculadora para refinar cueros y pieles",
        tecidodesc: "Refino de Tecido",
        madeiradesc: "Refino de Madeira",
        pedradesc: "Refino de Pedra",
        outrosdesc: "Outros Refinos",
        copyright: "© 2025 Calculadora de refinación - Albion Online. Reservados todos los derechos."
    }
};

const langButtons = document.querySelectorAll(".language-selector img");
const title = document.getElementById("title");
const titulo = document.getElementById("titulo");
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

  title.textContent = translation.title;
  titulo.textContent = translation.titulo;
  minerio.textContent = translation.minerio;
  pelego.textContent = translation.pelego;
  tecido.textContent = translation.tecido;
  madeira.textContent = translation.madeira;
  pedra.textContent = translation.pedra;
  outros.textContent = translation.outros;
  mineriodesc.textContent = translation.mineriodesc;
  pelegodesc.textContent = translation.pelegodesc;
  tecidodesc.textContent = translation.tecidodesc;
  madeiradesc.textContent = translation.madeiradesc;
  pedradesc.textContent = translation.pedradesc;
  outrosdesc.textContent = translation.outrosdesc;
  copyright.textContent = translation.copyright;
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
