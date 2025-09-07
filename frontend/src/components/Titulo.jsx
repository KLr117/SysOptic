
import React from "react";
import "../styles/vista-orden-trabajo.css"; // Importa tus estilos

// Componente Titulo
// Props:
// - text: texto a mostrar
// - className: clases adicionales de Tailwind o CSS
const Titulo = ({ text, className = "" }) => {
  return <h1 className={className}>{text}</h1>;
};

export default Titulo;
