import React, { useContext, useEffect, useMemo, useState } from "react";
import { BarChart3, QrCode, ShieldCheck, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { isStaffRole, todayLabel } from "../utils/helpers.js";
import Avatar from "../components/Avatar.jsx";

// Check-in de presenca da congregacao (nao so das criancas): a equipe mostra
// o QR nessa tela (numa TV/tablet na entrada), cada pessoa escaneia com o
// proprio celular e a presenca dela e marcada na hora — sem precisar de
// ninguem escaneando pelos outros. Aba "Painel" traz um resumo historico.
function PresencaScreen({ onBack }) {
  const me = useContext(UserContext);
  const isStaff = isStaffRole(me.role);
  const [tab, setTab] = useState("checkin");
  const [all, setAll] = useState([]);
  const todayL = todayLabel();
  const qrUrl = `${window.location.origin}/?presenca=1`;

  useEffect(() => {
    if (!isStaff) return;
    const unsub = onSnapshot(collection(db, "presencas"), snap => {
      setAll(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("PRESENCA_LOAD_ERR", err.code, err.message));
    return () => unsub();
  }, [isStaff]);

  const today = useMemo(() =>
    all.filter(p => p.dateLabel === todayL).sort((a, b) => (b.at?.toMillis?.() || 0) - (a.at?.toMillis?.() || 0)),
    [all, todayL]);

  const porMes = useMemo(() => {
    const counts = new Map();
    let minDate = null;
    all.forEach(p => {
      const dt = p.at?.toDate?.();
      if (!dt) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      counts.set(key, (counts.get(key) || 0) + 1);
      if (!minDate || dt < minDate) minDate = dt;
    });
    if (!minDate) return [];
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const months = [];
    let cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      const label = cursor.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
      months.push({ key, label, count: counts.get(key) || 0 });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return months;
  }, [all]);

  const porDia = useMemo(() => {
    const map = new Map();
    all.forEach(p => {
      const dt = p.at?.toDate?.();
      const key = dt ? `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}` : p.dateLabel;
      const ms = dt ? dt.getTime() : 0;
      const entry = map.get(key) || { label: p.dateLabel, ms, count: 0 };
      entry.count += 1;
      if (ms > entry.ms) entry.ms = ms;
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => b.ms - a.ms).slice(0, 12);
  }, [all]);

  if (!isStaff) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        </div>
        <div className="px-6 mt-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#8A8A8A1E" }}>
            <ShieldCheck size={24} color="#8A8A8A" />
          </div>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Acesso restrito</p>
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12.5px] leading-relaxed">Essa área é só pra quem tem cargo Junta ou Liderança.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Presença</h1>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">Check-in da congregação por QR</p>
      </div>

      <div className="flex gap-2 px-6 mb-5">
        <button onClick={() => setTab("checkin")} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: tab === "checkin" ? "#000000" : "#FFFFFF", color: tab === "checkin" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Check-in
        </button>
        <button onClick={() => setTab("painel")} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: tab === "painel" ? "#000000" : "#FFFFFF", color: tab === "painel" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Painel
        </button>
      </div>

      {tab === "checkin" && (
        <>
          <div className="mx-6 mb-6 rounded-3xl p-6 flex flex-col items-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="p-4 rounded-2xl mb-3" style={{ background: "#FFFFFF", border: "1px solid #E3E3E3" }}>
              <QRCodeSVG value={qrUrl} size={190} bgColor="#FFFFFF" fgColor="#000000" level="M" />
            </div>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] flex items-center gap-1.5">
              <QrCode size={12} /> Cada pessoa precisa estar logada no app
            </p>
          </div>

          <div className="px-6 pb-10">
            <p style={{ fontFamily: "Inter", color: "#4D4D4D", fontWeight: 600 }} className="text-[12px] mb-3 flex items-center gap-1.5">
              <Users size={13} /> Presentes hoje ({today.length})
            </p>
            {today.length === 0 ? (
              <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Ninguém marcou presença ainda hoje.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {today.map(p => (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <Avatar name={p.name} uid={p.uid} size={36} fontSize={10.5} />
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] flex-1">{p.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "painel" && (
        <div className="px-6 pb-10">
          <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "#000000" }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
              <BarChart3 size={19} color="#FFFFFF" />
            </div>
            <div>
              <p style={{ fontFamily: "Fraunces", color: "#FFFFFF", fontWeight: 600 }} className="text-[20px] leading-none">{all.length}</p>
              <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.7)" }} className="text-[11px] mt-1">{all.length === 1 ? "presença registrada no total" : "presenças registradas no total"}</p>
            </div>
          </div>

          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] font-semibold mb-3">Presença por mês</p>
          {porMes.length === 0 ? (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] mb-6">Nada registrado ainda.</p>
          ) : (() => {
            const max = Math.max(1, ...porMes.map(m => m.count));
            const barW = 26, step = 50, padTop = 22, padBottom = 22, plotH = 120;
            const w = Math.max(porMes.length * step + 20, 280);
            const h = padTop + plotH + padBottom;
            const x = (i) => 10 + i * step + step / 2;
            const y = (count) => padTop + plotH - (count / max) * plotH;
            const linePoints = porMes.map((m, i) => `${x(i)},${y(m.count)}`).join(" ");
            return (
              <div className="rounded-2xl p-4 mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3B7D8A" }} />
                    <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10.5px]">Presenças no mês</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1F4B54" }} />
                    <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10.5px]">Tendência</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <svg width={w} height={h} style={{ minWidth: w }}>
                    {[0, 0.5, 1].map(f => (
                      <line key={f} x1={0} x2={w} y1={padTop + plotH * f} y2={padTop + plotH * f} stroke="#EEEEEE" strokeWidth={1} />
                    ))}
                    {porMes.map((m, i) => (
                      <rect key={m.key} x={x(i) - barW / 2} y={y(m.count)} width={barW} height={Math.max(2, padTop + plotH - y(m.count))} rx={4} fill="#3B7D8A" opacity={0.85} />
                    ))}
                    <polyline points={linePoints} fill="none" stroke="#1F4B54" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    {porMes.map((m, i) => (
                      <circle key={m.key} cx={x(i)} cy={y(m.count)} r={3.5} fill="#1F4B54" />
                    ))}
                    {porMes.map((m, i) => (
                      <text key={m.key} x={x(i)} y={h - 4} textAnchor="middle" fontSize={9.5} fontFamily="Inter" fill="#9E9E9E">{m.label}</text>
                    ))}
                    {porMes.map((m, i) => (
                      <text key={m.key} x={x(i)} y={y(m.count) - 8} textAnchor="middle" fontSize={10} fontFamily="IBM Plex Mono" fontWeight={600} fill="#1F4B54">{m.count}</text>
                    ))}
                  </svg>
                </div>
              </div>
            );
          })()}

          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] font-semibold mb-3">Presença por dia (últimos)</p>
          {porDia.length === 0 ? (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nada registrado ainda.</p>
          ) : (
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {(() => {
                const max = Math.max(1, ...porDia.map(d => d.count));
                return porDia.map(d => (
                  <div key={d.ms + d.label}>
                    <div className="flex items-center justify-between mb-1">
                      <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px]">{d.label}</p>
                      <p style={{ fontFamily: "IBM Plex Mono", color: "#707070" }} className="text-[11px]">{d.count}</p>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: "#F2F2F2" }}>
                      <div className="h-full rounded-full" style={{ width: `${(d.count / max) * 100}%`, background: "#3B7D8A" }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PresencaScreen;
