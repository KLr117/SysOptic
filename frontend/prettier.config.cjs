// prettier.config.cjs
module.exports = {
// === Reglas principales ===
  semi: true,                // punto y coma obligatorio
  singleQuote: true,         // comillas simples en JS/JSX
  trailingComma: 'es5',      // coma final donde ES5 lo permite
  printWidth: 100,           // ancho de línea recomendado para React
  tabWidth: 2,               // 2 espacios por indentación
  useTabs: false,            // usa espacios, no tabs
  bracketSpacing: true,      // espacios entre llaves { foo: bar }
  arrowParens: 'always',     // siempre usar paréntesis en arrow functions
  jsxSingleQuote: false,     // en JSX usar comillas dobles
  jsxBracketSameLine: false, // > en JSX va en nueva línea
  endOfLine: 'auto',         // adapta a Windows/Linux automáticamente

  // === Opcional: para asegurar formato en otros tipos ===
  proseWrap: 'preserve',     // no forzar saltos de línea en texto (Markdown)

  /*
  // Agrega punto y coma al final de cada línea
  semi: true,

  // Usa comillas simples en lugar de comillas dobles
  singleQuote: true,

  // Coma final: 'es5' agrega comas donde ES5 lo permite (objetos y arrays)
  // Otras opciones: 'none' (nunca), 'all' (en todos los lugares posibles)
  trailingComma: 'es5',

  // Máximo ancho de línea antes de que Prettier rompa el código
  printWidth: 80,

  // Cantidad de espacios por tabulación
  tabWidth: 2,

  // Usa espacios en lugar de tabuladores
  useTabs: false,

  // Espacios entre llaves en objetos literales { key: value }
  bracketSpacing: true,

  // Posición de los paréntesis en las funciones flecha: 'always' | 'avoid'
  arrowParens: 'always',

  // Formato de JSX: poner la primera letra de las etiquetas en mayúscula en la misma línea
  jsxSingleQuote: false,

  // Determina cómo Prettier trata los saltos de línea
  endOfLine: 'lf',

  // Permite que Prettier formatee HTML, JSON, CSS, etc.
  // Se puede configurar adicionalmente si quieres ignorar ciertos archivos
  */
};
