import React, { useContext, useEffect } from "react";
import { Bell } from "lucide-react";
import { NotificationsContext } from "../context/contexts.js";

function NotificationsScreen({ onBack }) {
  const { notifications, markAllRead, openNotificationLink } = useContext(NotificationsContext);

  useEffect(() => {
    markAllRead();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Notificações</h1>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-2.5">
        {notifications.length === 0 ? (
          <div className="rounded-2xl py-10 text-center" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Nenhuma notificação por enquanto.</p>
          </div>
        ) : notifications.map(n => (
          <button key={n.id} onClick={() => openNotificationLink(n.link)} disabled={!n.link?.tile}
            className="w-full flex items-start gap-3 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
            style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
              <Bell size={15} color="#4D4D4D" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "Inter", color: "#000000" }} className="text-[13px] leading-snug">{n.text}</p>
              <p style={{ fontFamily: "IBM Plex Mono", color: "#9E9E9E" }} className="text-[10px] mt-1">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default NotificationsScreen;
