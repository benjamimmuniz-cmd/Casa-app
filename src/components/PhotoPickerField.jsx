import React, { useRef } from "react";
import { Camera, X } from "lucide-react";
import { compressImage } from "../utils/imageCompress.js";

function PhotoPickerField({ photo, onChange, label = "Foto (opcional)" }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => onChange(await compressImage(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3 mb-3">
      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: "#0000000F", border: "1px dashed #D6D6D6" }}>
        {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Camera size={18} color="#9E9E9E" />}
      </button>
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <button type="button" onClick={() => inputRef.current?.click()}
            className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
            style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
            {photo ? "Trocar" : "Escolher foto"}
          </button>
          {photo && (
            <button type="button" onClick={() => onChange(null)}
              className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ fontFamily: "Inter", color: "#707070" }}>
              <X size={11} /> Remover
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default PhotoPickerField;
