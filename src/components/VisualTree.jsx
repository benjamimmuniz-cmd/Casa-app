import React, { useState, useEffect, useContext, createContext } from "react";
import { collectAll, colorFor, computeLayout, initials, levelColor, statusOf } from "../utils/helpers.js";
import { UNIT, LEVEL_H, CARD_W, CARD_H } from "../data/constants.js";

function VisualTree({ tree, openProfile, levelOf, rowLabels }) {
  const { positions, totalLeaves, maxLevel } = computeLayout(tree, levelOf);
  const rowCount = rowLabels ? rowLabels.length : maxLevel + 1;
  const width = Math.max(totalLeaves * UNIT, 340);
  const height = rowCount * LEVEL_H + 30;
  const px = (id) => positions[id].x * UNIT + UNIT / 2;
  const py = (id) => positions[id].level * LEVEL_H + 16;
  const allNodes = collectAll(tree);

  const renderEdges = (node) => {
    if (node.children.length === 0) return null;
    const parentX = px(node.id), busY = py(node.id) + CARD_H + (LEVEL_H - CARD_H) / 2 - 16;
    const childXs = node.children.map(c => px(c.id));
    return (
      <React.Fragment key={"e" + node.id}>
        <line x1={parentX} y1={py(node.id) + CARD_H} x2={parentX} y2={busY} stroke="#D6D6D6" strokeWidth="2" />
        {node.children.length > 1 && (
          <line x1={Math.min(...childXs)} y1={busY} x2={Math.max(...childXs)} y2={busY} stroke="#D6D6D6" strokeWidth="2" />
        )}
        {node.children.map(c => (
          <line key={"l" + c.id} x1={px(c.id)} y1={busY} x2={px(c.id)} y2={py(c.id)} stroke="#D6D6D6" strokeWidth="2" />
        ))}
        {node.children.map(c => renderEdges(c))}
      </React.Fragment>
    );
  };

  const canvas = (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="absolute inset-0">
        {rowLabels && rowLabels.map((_, i) => (
          <line key={"row" + i} x1={0} y1={i * LEVEL_H} x2={width} y2={i * LEVEL_H} stroke="#E8E8E8" strokeWidth="1" />
        ))}
        {renderEdges(tree)}
      </svg>
      {allNodes.map(n => {
        const isRoot = n.id === tree.id;
        const st = statusOf(n.daysAgo);
        const bg = isRoot ? "#000000" : (n.nivel ? levelColor(n.nivel) : colorFor(n.id)) + "22";
        const fg = isRoot ? "#FFFFFF" : (n.nivel ? levelColor(n.nivel) : colorFor(n.id));
        return (
          <button key={n.id} onClick={() => openProfile(n.id)}
            className="absolute flex flex-col items-center gap-1 active:scale-95 transition-transform"
            style={{ left: px(n.id) - CARD_W / 2, top: py(n.id), width: CARD_W }}>
            <div className="relative">
              <div className="rounded-full flex items-center justify-center overflow-hidden" style={{ width: 36, height: 36, background: bg }}>
                {n.photo ? <img src={n.photo} alt="" className="w-full h-full object-cover" /> : <span style={{ fontFamily: "Fraunces", fontWeight: 600, color: fg }} className="text-[11px]">{initials(n.name)}</span>}
              </div>
              {!isRoot && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: st.color, border: "2px solid #F2F2F2" }} />}
            </div>
            <div className="rounded-lg px-1.5 py-1 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 2px rgba(0,0,0,0.08)", width: CARD_W }}>
              <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[9.5px] leading-tight truncate">{n.name.split(" ")[0]}</p>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[8px] leading-tight truncate">{n.role}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  if (!rowLabels) {
    return <div className="overflow-x-auto overflow-y-auto pb-6" style={{ maxHeight: 520 }}>{canvas}</div>;
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight: 520 }}>
      <div className="flex">
        <div className="shrink-0 pt-4" style={{ width: 58 }}>
          {rowLabels.map(l => (
            <div key={l} style={{ height: LEVEL_H }} className="flex items-start">
              <span style={{ fontFamily: "Inter", color: "#9E9E9E", letterSpacing: 0.3 }} className="text-[9px] uppercase font-semibold">{l}</span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto flex-1 pt-4 pb-6">{canvas}</div>
      </div>
    </div>
  );
}

export default VisualTree;
