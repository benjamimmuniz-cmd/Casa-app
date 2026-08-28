import React, { useContext, useEffect, useState } from "react";
import { Briefcase, ChevronRight, ImageIcon, MessageCircle, Plus, Tag, Trash2, X } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext, FeedContext } from "../context/contexts.js";
import { colorFor, initials, fmtPrice, timeAgo } from "../utils/helpers.js";
import { compressImage } from "../utils/imageCompress.js";
import { containsBlockedContent, BLOCKED_CONTENT_MESSAGE } from "../utils/contentFilter.js";
import Avatar from "../components/Avatar.jsx";
import PostCarousel from "../components/PostCarousel.jsx";
import ImageLightbox from "../components/ImageLightbox.jsx";

const CATEGORIES = ["Produto", "Serviço"];

// Agrupa as divulgações de um mesmo prestador em seções: Produtos primeiro,
// depois os Serviços separados por tipo (ex: Limpeza, Elétrica), pra ficar
// organizado quando a mesma pessoa oferece mais de uma coisa.
function buildSections(items) {
  const order = [];
  const map = new Map();
  items.forEach(i => {
    const key = i.category === "Serviço" ? (i.subcategory || "Serviços") : "Produtos";
    if (!map.has(key)) { map.set(key, []); order.push(key); }
    map.get(key).push(i);
  });
  order.sort((a, b) => (a === "Produtos" ? -1 : b === "Produtos" ? 1 : 0));
  return order.map(key => ({ label: key, items: map.get(key) }));
}

function sanitizeWhatsApp(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : "55" + digits;
}

// Vitrine de negocios dos membros: cada pessoa pode divulgar produtos ou
// servicos que oferece. A tela principal mostra quem ja divulgou algo —
// tocar na pessoa abre so as publicacoes dela, como uma vitrine propria.
function NegociosScreen({ onBack, sellerUid }) {
  const me = useContext(UserContext);
  const { addPost } = useContext(FeedContext);
  const [listings, setListings] = useState([]);
  const [viewSellerUid, setViewSellerUid] = useState(sellerUid || null);
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", price: "", category: CATEGORIES[0], subcategory: "", images: [], whatsapp: "" });
  const [postToFeed, setPostToFeed] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "negocios"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("NEGOCIOS_LOAD_ERR", err.code, err.message));
    return () => unsub();
  }, []);

  useEffect(() => { setViewSellerUid(sellerUid || null); }, [sellerUid]);

  const open = listings.find(l => l.id === openId);

  const sellersMap = new Map();
  listings.forEach(l => {
    const key = l.authorUid || l.authorName;
    if (!sellersMap.has(key)) sellersMap.set(key, { uid: l.authorUid, name: l.authorName, photo: l.authorPhoto, items: [] });
    sellersMap.get(key).items.push(l);
  });
  const sellers = [...sellersMap.values()];
  const viewingSeller = viewSellerUid ? sellersMap.get(viewSellerUid) : null;

  const handlePhotoPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => compressImage(reader.result, 900, 0.72).then(img => setForm(f => ({ ...f, images: [...f.images, img] })));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeFormImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const closeAdd = () => {
    setShowAdd(false);
    setForm({ title: "", desc: "", price: "", category: CATEGORIES[0], subcategory: "", images: [], whatsapp: "" });
    setFormError("");
  };

  const publish = async () => {
    setFormError("");
    if (!form.title.trim()) { setFormError("Digite o nome do produto ou serviço."); return; }
    if (containsBlockedContent(form.title) || containsBlockedContent(form.desc) || containsBlockedContent(form.subcategory)) { setFormError(BLOCKED_CONTENT_MESSAGE); return; }
    setSaving(true);
    try {
      const priceNum = form.price.trim() ? parseFloat(form.price.replace(",", ".")) : null;
      const price = priceNum !== null && !isNaN(priceNum) ? priceNum : null;
      const whatsapp = sanitizeWhatsApp(form.whatsapp);
      const subcategory = form.category === "Serviço" ? (form.subcategory.trim() || null) : null;
      await addDoc(collection(db, "negocios"), {
        authorUid: me.uid, authorName: me.name, authorPhoto: me.photo || null,
        title: form.title.trim(), desc: form.desc.trim(), price,
        category: form.category, subcategory, images: form.images, image: form.images[0] || null, whatsapp: whatsapp || null,
        createdAt: serverTimestamp(),
      });
      if (postToFeed) {
        addPost({
          author: me.name, authorUid: me.uid,
          text: `📣 ${me.name} está divulgando: ${form.title.trim()}${price !== null ? ` — ${fmtPrice(price)}` : ""}`,
          image: form.images[0] || null, kind: "negocio", negocioSellerUid: me.uid,
        }).catch(err => console.error("NEGOCIO_FEED_POST_ERR", err.code, err.message));
      }
      closeAdd();
    } catch (err) {
      console.error("NEGOCIO_ADD_ERR", err.code, err.message);
      setFormError("Não consegui publicar agora. Tenta de novo.");
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, "negocios", deleteConfirm.id));
      setDeleteConfirm(null);
      setOpenId(null);
    } catch (err) {
      console.error("NEGOCIO_DELETE_ERR", err.code, err.message);
    }
  };

  const contactWhatsApp = (listing) => {
    if (!listing.whatsapp) return;
    const msg = `Olá! Vi "${listing.title}" no app da Casa e tenho interesse.`;
    window.open(`https://wa.me/${listing.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "#F2F2F2" }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 pt-6 pb-2">
          <button onClick={viewingSeller ? () => setViewSellerUid(null) : onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>
            {viewingSeller ? "← Negócios e Divulgação" : "← Início"}
          </button>
        </div>

        {viewingSeller ? (
          <>
            <div className="px-6 mt-1 mb-5 flex items-center gap-3">
              <Avatar name={viewingSeller.name} uid={viewingSeller.uid} size={52} fontSize={15} />
              <div>
                <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[19px] leading-tight">{viewingSeller.name}</h1>
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-0.5">{viewingSeller.items.length} {viewingSeller.items.length === 1 ? "divulgação" : "divulgações"}</p>
              </div>
            </div>
            <div className="px-6 pb-28 flex flex-col gap-5">
              {buildSections(viewingSeller.items).map(section => (
                <div key={section.label}>
                  <p style={{ fontFamily: "IBM Plex Mono", color: "#707070" }} className="text-[10.5px] uppercase tracking-wide mb-2.5">{section.label}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {section.items.map(l => {
                      const thumb = (l.images && l.images[0]) || l.image;
                      return (
                        <button key={l.id} onClick={() => setOpenId(l.id)}
                          className="rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-transform"
                          style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                          <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: 84, background: thumb ? "#E8E8E8" : "#3B7D8A1E" }}>
                            {thumb ? <img src={thumb} alt={l.title} className="w-full h-full object-cover" /> : <Briefcase size={24} color="#3B7D8A" />}
                          </div>
                          <div className="p-3">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#3B7D8A1A", color: "#3B7D8A" }}>{l.subcategory ? `${l.category} · ${l.subcategory}` : l.category}</span>
                            <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] mt-1.5 leading-tight">{l.title}</p>
                            {l.price !== null && l.price !== undefined && (
                              <p style={{ fontFamily: "Fraunces", color: "#000000", fontWeight: 600 }} className="text-[14px] mt-1">{fmtPrice(l.price)}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="px-6 mt-1 mb-5">
              <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Negócios e Divulgação</h1>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">Produtos e serviços oferecidos por membros da igreja</p>
            </div>
            <div className="px-6 pb-28 flex flex-col gap-2.5">
              {sellers.length === 0 ? (
                <div className="rounded-2xl p-6 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <Briefcase size={22} color="#9E9E9E" style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Ninguém divulgou nada ainda. Seja o primeiro!</p>
                </div>
              ) : sellers.map(s => (
                <button key={s.uid || s.name} onClick={() => setViewSellerUid(s.uid)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <Avatar name={s.name} uid={s.uid} size={44} fontSize={12} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[14px] truncate">{s.name}</p>
                    <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">
                      {s.items.slice(0, 3).map(i => i.title).join(" · ")}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ fontFamily: "IBM Plex Mono", background: "#3B7D8A1A", color: "#3B7D8A" }}>
                    {s.items.length}
                  </span>
                  <ChevronRight size={15} color="#9E9E9E" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#3B7D8A", boxShadow: "0 6px 16px rgba(59,125,138,0.4)" }}>
        <Plus size={24} color="#FFFFFF" />
      </button>

      {open && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setOpenId(null)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            {(open.images && open.images.length ? open.images : (open.image ? [open.image] : [])).length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden mb-3" style={{ width: "100%", height: 220, background: "#E8E8E8" }}>
                <PostCarousel images={open.images && open.images.length ? open.images : [open.image]} fit="contain" onImageClick={setLightboxImage} />
                <button onClick={() => setOpenId(null)} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center z-10" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <X size={14} color="#FFFFFF" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#3B7D8A1E" }}>
                  <Briefcase size={24} color="#3B7D8A" />
                </div>
                <button onClick={() => setOpenId(null)}><X size={18} color="#9E9E9E" /></button>
              </div>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ fontFamily: "IBM Plex Mono", background: "#3B7D8A1A", color: "#3B7D8A" }}>
              <Tag size={10} /> {open.subcategory ? `${open.category} · ${open.subcategory}` : open.category}
            </span>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[19px] mt-2">{open.title}</p>
            {open.price !== null && open.price !== undefined && (
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3B7D8A" }} className="text-[20px] mt-1 mb-3">{fmtPrice(open.price)}</p>
            )}
            {open.desc && (
              <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[13px] leading-relaxed mb-3">{open.desc}</p>
            )}
            <div className="flex items-center gap-2.5 mb-5">
              <Avatar name={open.authorName} uid={open.authorUid} size={28} fontSize={9} />
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">{open.authorName} · {timeAgo(open.createdAt)}</p>
            </div>
            {open.whatsapp ? (
              <button onClick={() => contactWhatsApp(open)}
                className="w-full py-3.5 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
                <MessageCircle size={16} /> Falar no WhatsApp
              </button>
            ) : (
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11.5px] text-center">Sem contato direto informado.</p>
            )}
            {open.authorUid === me.uid && (
              <button onClick={() => setDeleteConfirm(open)}
                className="w-full mt-2.5 py-3.5 rounded-full font-semibold text-[13.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", color: "#B33B3B", fontFamily: "Inter", border: "1px solid #D6D6D6" }}>
                <Trash2 size={14} /> Excluir divulgação
              </button>
            )}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="absolute inset-0 flex items-end z-10" style={{ background: "rgba(0,0,0,0.45)" }} onClick={closeAdd}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-4">Divulgar produto ou serviço</p>

            <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11.5px] mb-2">Fotos (pode adicionar várias)</p>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative shrink-0 rounded-2xl overflow-hidden" style={{ width: 64, height: 64 }}>
                  <img src={img} alt="Prévia" className="w-full h-full object-cover" />
                  <button onClick={() => removeFormImage(idx)} className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <X size={9} color="#F2F2F2" />
                  </button>
                </div>
              ))}
              <label className="shrink-0 rounded-2xl flex items-center justify-center cursor-pointer" style={{ width: 64, height: 64, background: "#E8E8E8", border: "1px dashed #D6D6D6" }}>
                <ImageIcon size={18} color="#9E9E9E" />
                <input type="file" accept="image/*" multiple onChange={handlePhotoPick} className="hidden" />
              </label>
            </div>

            <div className="flex gap-2 mb-3">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setForm({ ...form, category: c })}
                  className="px-4 py-2 rounded-full text-[12px] font-semibold"
                  style={{ fontFamily: "Inter", background: form.category === c ? "#000000" : "#FFFFFF", color: form.category === c ? "#FFFFFF" : "#4D4D4D", border: form.category === c ? "none" : "1px solid #D6D6D6" }}>
                  {c}
                </button>
              ))}
            </div>

            {form.category === "Serviço" && (
              <input value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} placeholder="Tipo de serviço (ex: Limpeza, Elétrica, Aulas...)"
                className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            )}

            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Nome do produto ou serviço"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Preço (opcional, ex: 25,00)" inputMode="decimal"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Descrição (opcional)" rows={3}
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px] resize-none"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "") })} placeholder="Seu WhatsApp (ex: 81996840938)" inputMode="numeric"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label className="flex items-center gap-2.5 mb-4 cursor-pointer">
              <input type="checkbox" checked={postToFeed} onChange={e => setPostToFeed(e.target.checked)}
                className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Publicar também no Feed</span>
            </label>

            {formError && (
              <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12px] mb-4 text-center">{formError}</p>
            )}

            <button onClick={publish} disabled={!form.title.trim() || saving}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              {saving ? "Publicando..." : "Publicar divulgação"}
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="absolute inset-0 flex items-end z-10" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setDeleteConfirm(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Excluir "{deleteConfirm.title}"?</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-5">Não tem como desfazer depois.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D", border: "1px solid #D6D6D6" }}>
                Cancelar
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
}

export default NegociosScreen;
