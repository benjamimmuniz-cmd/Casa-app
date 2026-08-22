import React, { useState, useEffect, useContext, createContext } from "react";

function ReadingHeatmap({ daysRead }) {
  const total = 365;
  const cols = 53;
  const cells = Array.from({ length: total }, (_, i) => {
    const skipped = i === 14 || i === 29 || i === 33; // pequenas falhas, pra ficar realista
    return { read: i < daysRead && !skipped, today: i === daysRead - 1 };
  });
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateRows: "repeat(7, 8px)", gridAutoFlow: "column", gridTemplateColumns: `repeat(${cols}, 8px)` }}>
      {cells.map((c, i) => (
        <div key={i} className="rounded-[2px]" style={{
          width: 8, height: 8,
          background: c.read ? "#2B2B2B" : "transparent",
          border: c.read ? "none" : "1px solid #D6D6D6",
          outline: c.today ? "2px solid #000000" : "none",
          outlineOffset: c.today ? "1px" : "0",
        }} />
      ))}
    </div>
  );
}

export default ReadingHeatmap;
