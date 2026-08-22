import React, { useState, useEffect, useContext, createContext } from "react";
import {
  ChevronRight
} from "lucide-react";
import { colorFor, initials, levelColor, statusOf } from "../utils/helpers.js";

function TreeRow({ node, depth, expanded, toggleExpand, openProfile, openAddModal }) {
  const st = statusOf(node.daysAgo);
  const isExpanded = expanded.has(node.id);
  return (
    <div>
      <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 18 }}>
        {node.children.length > 0 ? (
          <button onClick={() => toggleExpand(node.id)} className="w-5 h-5 flex items-center justify-center shrink-0">
            <ChevronRight size={13} color="#9E9E9E" style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>
        ) : <div className="w-5 shrink-0" />}
        <button onClick={() => openProfile(node.id)}
          className="flex items-center gap-2.5 flex-1 py-2 rounded-xl text-left active:opacity-70">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden" style={{ background: colorFor(node.id) + "22" }}>
              {node.photo ? <img src={node.photo} alt="" className="w-full h-full object-cover" /> : <span style={{ fontFamily: "Fraunces", color: colorFor(node.id), fontWeight: 600 }} className="text-[11px]">{initials(node.name)}</span>}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: st.color, border: "2px solid #F2F2F2" }} />
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{node.name}</p>
            <div className="flex items-center gap-1.5">
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{node.role}</p>
              {node.nivel && (
                <span className="text-[8.5px] px-1.5 rounded-full shrink-0" style={{ fontFamily: "IBM Plex Mono", background: levelColor(node.nivel) + "1E", color: levelColor(node.nivel) }}>
                  {node.nivel}
                </span>
              )}
            </div>
          </div>
        </button>
        {node.children.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{ fontFamily: "IBM Plex Mono", background: "#5A5A5A22", color: "#5C6B45" }}>
            +{node.children.length}
          </span>
        )}
        <button onClick={() => openAddModal(node.id)} className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
          <span style={{ color: "#616161", fontSize: 13, lineHeight: 1 }}>+</span>
        </button>
      </div>
      {isExpanded && node.children.length > 0 && (
        <div style={{ borderLeft: "1.5px solid #D6D6D6", marginLeft: depth * 18 + 9 }}>
          {node.children.map(child => (
            <TreeRow key={child.id} node={child} depth={0} expanded={expanded} toggleExpand={toggleExpand} openProfile={openProfile} openAddModal={openAddModal} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeRow;
