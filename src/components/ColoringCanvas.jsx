import React from "react";

// Desenho de colorir interativo: cada "shape" sem `locked` é uma região
// clicável, pintada com a cor em `fills[shape.id]`. Formas com o mesmo id
// pintam juntas (ex: as 3 nuvens da pombinha). `locked` são detalhes fixos
// (olho, bico, cruzinha) que nunca mudam de cor.
function ColoringCanvas({ page, fills, onRegionClick, interactive = true }) {
  return (
    <svg viewBox={page.viewBox} className="w-full h-full" style={{ touchAction: "manipulation" }}>
      {page.shapes.map((s, i) => {
        const Tag = s.tag;
        if (s.locked) {
          return <Tag key={i} {...s.props} strokeLinejoin="round" strokeLinecap="round" />;
        }
        const paint = s.paint || "fill";
        const color = fills[s.id] || "#FFFFFF";
        const paintProps = paint === "stroke"
          ? { stroke: color, fill: "none" }
          : { fill: color, stroke: "#2B2B2B", strokeWidth: s.props["stroke-width"] || 5 };
        return (
          <Tag key={i} {...s.props} {...paintProps}
            strokeLinejoin="round" strokeLinecap="round"
            onClick={interactive ? () => onRegionClick(s.id) : undefined}
            style={interactive ? { cursor: "pointer" } : undefined} />
        );
      })}
    </svg>
  );
}

export default ColoringCanvas;
