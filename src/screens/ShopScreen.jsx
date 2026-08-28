import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Minus,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
  X
} from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { FeedContext, UserContext } from "../context/contexts.js";
import { fmtPrice, timeAgo } from "../utils/helpers.js";
import { PRODUCT_COLORS } from "../data/constants.js";
import { compressImage } from "../utils/imageCompress.js";
import PostCarousel from "../components/PostCarousel.jsx";
import ImageLightbox from "../components/ImageLightbox.jsx";
import { createPedido, generateOrderCode } from "../utils/storeActions.js";
import { markCartStarted, clearCartStarted, isCartExpired } from "../utils/cartExpiry.js";

function sanitizeWhatsApp(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : "55" + digits;
}

function ShopScreen({ onBack, title, subtitle, products, addProduct, updateStock, updateProduct, deleteProduct, categories, accent, waNumber, layout = "grid" }) {
  const me = useContext(UserContext);
  const meName = me.name || "Alguém da igreja";
  const { addPost } = useContext(FeedContext);
  const cartStorageKey = `casa-app:cart:${title}`;
  const [cart, setCart] = useState(() => {
    try {
      if (isCartExpired(title)) { clearCartStarted(title); localStorage.removeItem(cartStorageKey); return {}; }
      const saved = localStorage.getItem(cartStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [cartExpiredMsg, setCartExpiredMsg] = useState(false);
  const activeTabStorageKey = `casa-app:activeTab:${title}`;
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem(activeTabStorageKey) || "produtos"; } catch { return "produtos"; }
  });
  useEffect(() => {
    try { localStorage.setItem(activeTabStorageKey, activeTab); } catch {}
  }, [activeTab]);
  const [pedidos, setPedidos] = useState([]);
  const [openProductId, setOpenProductId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [orderDone, setOrderDone] = useState(false);
  const [lastOrderCode, setLastOrderCode] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", desc: "", category: categories[0], images: [], stock: "", whatsapp: "" });
  const [postToFeed, setPostToFeed] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      if (Object.values(cart).some(q => q > 0)) localStorage.setItem(cartStorageKey, JSON.stringify(cart));
      else localStorage.removeItem(cartStorageKey);
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!me.uid) return;
    const unsub = onSnapshot(query(collection(db, "pedidos"), where("buyerUid", "==", me.uid)), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.store === title);
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPedidos(list);
    }, err => console.error("PEDIDOS_LOAD_ERR", err.code, err.message));
    return () => unsub();
  }, [me.uid, title]);

  useEffect(() => {
    const check = () => {
      if (!isCartExpired(title)) return;
      setCart(prev => (Object.values(prev).some(q => q > 0) ? {} : prev));
      clearCartStarted(title);
      setCartExpiredMsg(true);
      setTimeout(() => setCartExpiredMsg(false), 4000);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [title]);

  const product = products.find(p => p.id === openProductId);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = Object.entries(cart).reduce((s, [id, q]) => {
    const p = products.find(pr => pr.id === id);
    return s + (p ? p.price * q : 0);
  }, 0);

  const addToCart = (id, delta = 1) => {
    setCart(prev => {
      const wasEmpty = !Object.values(prev).some(q => q > 0);
      const p = products.find(pr => pr.id === id);
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const capped = p ? Math.min(next, p.stock) : next;
      const updated = { ...prev, [id]: capped };
      const isEmptyNow = !Object.values(updated).some(q => q > 0);
      if (wasEmpty && !isEmptyNow) markCartStarted(title);
      if (isEmptyNow) clearCartStarted(title);
      return updated;
    });
  };

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

  const closeAddSheet = () => {
    setShowAdd(false);
    setEditingProductId(null);
    setForm({ name: "", price: "", desc: "", category: categories[0], images: [], stock: "", whatsapp: "" });
    setFormError("");
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
      setOpenProductId(null);
    } catch (err) {
      console.error("PRODUCT_DELETE_ERR", err.code, err.message);
    }
  };

  const openEditProduct = (p) => {
    setForm({ name: p.name, price: String(p.price).replace(".", ","), desc: p.desc === "Sem descrição." ? "" : p.desc, category: p.category, images: p.images && p.images.length ? p.images : (p.image ? [p.image] : []), stock: String(p.stock), whatsapp: p.whatsapp ? p.whatsapp.replace(/^55/, "") : "" });
    setEditingProductId(p.id);
    setOpenProductId(null);
    setShowAdd(true);
  };

  const handleAddProduct = async () => {
    setFormError("");
    if (!form.name.trim()) { setFormError("Digite o nome do produto."); return; }
    if (!form.price.trim()) { setFormError("Digite o preço do produto."); return; }
    const price = parseFloat(form.price.replace(",", "."));
    if (isNaN(price) || price < 0) { setFormError("Preço inválido — use algo como 19,90."); return; }
    let stock = parseInt(form.stock, 10);
    if (form.stock.trim() === "" || isNaN(stock) || stock < 0) stock = 0;

    const whatsapp = sanitizeWhatsApp(form.whatsapp);

    if (editingProductId) {
      try {
        await updateProduct(editingProductId, {
          name: form.name.trim(), price, desc: form.desc.trim() || "Sem descrição.", category: form.category, images: form.images, image: form.images[0] || null, stock, whatsapp: whatsapp || null,
        });
        closeAddSheet();
      } catch (err) {
        console.error("PRODUCT_UPDATE_ERR", err.code, err.message);
        setFormError("Não deu pra salvar. Tenta de novo.");
      }
      return;
    }

    try {
      const color = PRODUCT_COLORS[products.length % PRODUCT_COLORS.length];
      await addProduct({
        name: form.name.trim(), price, desc: form.desc.trim() || "Sem descrição.", category: form.category, color, images: form.images, image: form.images[0] || null, stock, author: meName, whatsapp: whatsapp || null,
      });
      if (postToFeed) {
        addPost({
          author: meName,
          text: `Novidade na ${title}: ${form.name.trim()} — ${fmtPrice(price)}${form.desc.trim() ? `\n${form.desc.trim()}` : ""}`,
          image: form.images[0] || null,
          kind: title === "Casa Cantina" ? "cardapio" : "produto",
        }).catch(err => console.error("PRODUCT_FEED_POST_ERR", err.code, err.message));
      }
      closeAddSheet();
    } catch (err) {
      console.error("PRODUCT_ADD_ERR", err.code, err.message);
      setFormError("Não deu pra cadastrar. Tenta de novo.");
    }
  };

  const notifyWhatsApp = (items, total, code, number) => {
    const lines = items.map(([id, qty]) => {
      const p = products.find(pr => pr.id === id);
      return p ? `• ${qty}x ${p.name} — ${fmtPrice(p.price * qty)}` : "";
    }).filter(Boolean).join("\n");
    const msg = `Novo pedido em ${title} — Pedido #${code}:\n${lines}\n\nTotal: ${fmtPrice(total)}`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const finalizeOrder = () => {
    const items = Object.entries(cart).filter(([, q]) => q > 0);
    const orderItems = [];
    const bySeller = {};
    items.forEach(([id, qty]) => {
      const p = products.find(pr => pr.id === id);
      if (p) {
        updateStock(id, Math.max(0, p.stock - qty));
        orderItems.push({ id, name: p.name, qty, price: p.price });
        const sellerNumber = p.whatsapp || waNumber;
        if (!bySeller[sellerNumber]) bySeller[sellerNumber] = { items: [], total: 0 };
        bySeller[sellerNumber].items.push([id, qty]);
        bySeller[sellerNumber].total += p.price * qty;
      }
    });
    const code = generateOrderCode();
    createPedido({ store: title, buyerUid: me.uid, buyerName: meName, items: orderItems, total: cartTotal, code })
      .catch(err => console.error("PEDIDO_CREATE_ERR", err.code, err.message));
    Object.entries(bySeller).forEach(([number, group]) => notifyWhatsApp(group.items, group.total, code, number));
    setLastOrderCode(code);
    setOrderDone(true);
    setCart({});
    clearCartStarted(title);
  };

  return (
    <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "#F2F2F2" }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <button onClick={() => setActiveTab("carrinho")} className="relative">
          <ShoppingCart size={19} color="#000000" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: accent }}>
              <span style={{ fontFamily: "IBM Plex Mono", color: "#F2F2F2", fontSize: 9 }}>{cartCount}</span>
            </span>
          )}
        </button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">{title}</h1>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">{subtitle}</p>
      </div>

      {cartExpiredMsg && (
        <div className="mx-6 mb-4 px-4 py-2.5 rounded-2xl flex items-center gap-2" style={{ background: "#00000008" }}>
          <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11.5px]">Seu carrinho expirou após 24h sem finalizar e os itens voltaram a ficar disponíveis.</span>
        </div>
      )}

      <div className="px-6 mb-5 flex items-center gap-2">
        <button onClick={() => setActiveTab("produtos")}
          className="px-4 py-2 rounded-full text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: activeTab === "produtos" ? "#000000" : "#FFFFFF", color: activeTab === "produtos" ? "#FFFFFF" : "#4D4D4D", border: activeTab === "produtos" ? "none" : "1px solid #D6D6D6" }}>
          Produtos
        </button>
        <button onClick={() => setActiveTab("pedidos")}
          className="px-4 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5"
          style={{ fontFamily: "Inter", background: activeTab === "pedidos" ? "#000000" : "#FFFFFF", color: activeTab === "pedidos" ? "#FFFFFF" : "#4D4D4D", border: activeTab === "pedidos" ? "none" : "1px solid #D6D6D6" }}>
          <Receipt size={12} /> Meus Pedidos
        </button>
        <button onClick={() => setActiveTab("carrinho")}
          className="px-4 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5"
          style={{ fontFamily: "Inter", background: activeTab === "carrinho" ? "#000000" : "#FFFFFF", color: activeTab === "carrinho" ? "#FFFFFF" : "#4D4D4D", border: activeTab === "carrinho" ? "none" : "1px solid #D6D6D6" }}>
          <ShoppingCart size={12} /> Carrinho{cartCount > 0 ? ` (${cartCount})` : ""}
        </button>
      </div>

      {activeTab === "carrinho" ? (
        <div className="px-6 pb-28">
          {orderDone ? (
            <div className="py-6 text-center">
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-3">Pedido registrado! 🎉</p>
              {lastOrderCode && (
                <div className="inline-block px-5 py-3 rounded-2xl mb-3" style={{ background: "#00000008", border: "1px dashed #D6D6D6" }}>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10px] mb-0.5">Apresente esse código na loja</p>
                  <p style={{ fontFamily: "IBM Plex Mono", color: "#000000", fontWeight: 600 }} className="text-[22px]">#{lastOrderCode}</p>
                </div>
              )}
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Abrimos o WhatsApp do responsável com os detalhes do pedido pra combinar pagamento e retirada.</p>
              <button onClick={() => { setOrderDone(false); setLastOrderCode(null); }}
                className="px-5 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                Voltar ao carrinho
              </button>
            </div>
          ) : cartCount === 0 ? (
            <div className="text-center py-8">
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Seu carrinho está vazio.</p>
              <button onClick={() => setActiveTab("produtos")}
                className="px-5 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                Continuar comprando
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 mb-5">
                {Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => {
                  const p = products.find(pr => pr.id === id);
                  if (!p) return null;
                  const thumb = (p.images && p.images[0]) || p.image;
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: thumb ? "#E8E8E8" : p.color + "1E" }}>
                        {thumb ? <img src={thumb} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingBag size={16} color={p.color} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] truncate">{p.name}</p>
                        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{fmtPrice(p.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => addToCart(id, -1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#E3E3E3" }}>
                          <Minus size={11} color="#000000" />
                        </button>
                        <span style={{ fontFamily: "IBM Plex Mono", color: "#000000" }} className="text-[12px] w-4 text-center">{qty}</span>
                        <button onClick={() => addToCart(id, 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#E3E3E3" }}>
                          <span style={{ color: "#000000", fontSize: 12 }}>+</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mb-5 pt-3 px-1" style={{ borderTop: "1px solid #D6D6D6" }}>
                <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[13px]">Total</span>
                <span style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px]">{fmtPrice(cartTotal)}</span>
              </div>
              <button onClick={finalizeOrder}
                className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
                style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
                Finalizar pedido
              </button>
              <button onClick={() => setActiveTab("produtos")}
                className="w-full py-3 rounded-full font-semibold text-[12.5px] mt-2.5"
                style={{ fontFamily: "Inter", background: "transparent", color: "#4D4D4D" }}>
                Continuar comprando
              </button>
            </>
          )}
        </div>
      ) : activeTab === "pedidos" ? (
        <div className="px-6 pb-28 flex flex-col gap-3">
          {pedidos.length === 0 ? (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-8">Você ainda não fez nenhum pedido aqui.</p>
          ) : pedidos.map(ped => (
            <div key={ped.id} className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[14px]">{fmtPrice(ped.total)}</span>
                  {ped.code && (
                    <span className="px-2 py-0.5 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#00000008", color: "#4D4D4D", fontSize: 10 }}>#{ped.code}</span>
                  )}
                </div>
                <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">{timeAgo(ped.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {(ped.items || []).map((it, idx) => (
                  <p key={idx} style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px]">{it.qty}x {it.name}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : layout === "grid" ? (
        <div className="px-6 pb-28 grid grid-cols-2 gap-3">
          {products.map(p => (
            <button key={p.id} onClick={() => setOpenProductId(p.id)}
              className="rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-transform relative"
              style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", opacity: p.stock === 0 ? 0.55 : 1 }}>
              <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: 84, background: p.image ? "#E8E8E8" : p.color + "1E" }}>
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingBag size={26} color={p.color} />}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: p.color + "1A", color: p.color }}>{p.category}</span>
                  <span className="text-[9px]" style={{ fontFamily: "IBM Plex Mono", color: p.stock === 0 ? "#8A8A8A" : "#707070" }}>
                    {p.stock === 0 ? "esgotado" : `${p.stock} un`}
                  </span>
                </div>
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] mt-1.5 leading-tight">{p.name}</p>
                <p style={{ fontFamily: "Fraunces", color: "#000000", fontWeight: 600 }} className="text-[14px] mt-1">{fmtPrice(p.price)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-6 pb-28 flex flex-col gap-2.5">
          {products.map(p => (
            <button key={p.id} onClick={() => setOpenProductId(p.id)}
              className="flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
              style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", opacity: p.stock === 0 ? 0.55 : 1 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: p.image ? "#E8E8E8" : p.color + "1E" }}>
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingBag size={18} color={p.color} />}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Fraunces", color: "#000000", fontWeight: 600 }} className="text-[14px] truncate">{p.name}</p>
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{p.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p style={{ fontFamily: "Fraunces", color: "#000000", fontWeight: 600 }} className="text-[14px]">{fmtPrice(p.price)}</p>
                <span className="text-[9px]" style={{ fontFamily: "IBM Plex Mono", color: p.stock === 0 ? "#8A8A8A" : "#707070" }}>
                  {p.stock === 0 ? "esgotado" : `${p.stock} un`}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      </div>

      <button onClick={() => { closeAddSheet(); setShowAdd(true); }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: accent, boxShadow: `0 6px 16px ${accent}66` }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {product && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setOpenProductId(null)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            {(product.images && product.images.length ? product.images : (product.image ? [product.image] : [])).length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden mb-3" style={{ width: "100%", height: 220, background: "#E8E8E8" }}>
                <PostCarousel images={product.images && product.images.length ? product.images : [product.image]} fit="contain" onImageClick={setLightboxImage} />
                <button onClick={() => setOpenProductId(null)} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center z-10" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <X size={14} color="#FFFFFF" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: product.color + "1E" }}>
                  <ShoppingBag size={24} color={product.color} />
                </div>
                <button onClick={() => setOpenProductId(null)}><X size={18} color="#9E9E9E" /></button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ fontFamily: "IBM Plex Mono", background: product.color + "1A", color: product.color }}>
                <Tag size={10} /> {product.category}
              </span>
              <span className="text-[10px]" style={{ fontFamily: "IBM Plex Mono", color: product.stock === 0 ? "#8A8A8A" : "#707070" }}>
                {product.stock === 0 ? "Esgotado" : `${product.stock} disponíveis`}
              </span>
            </div>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[19px] mt-2">{product.name}</p>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: accent }} className="text-[20px] mt-1 mb-3">{fmtPrice(product.price)}</p>
            <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[13px] leading-relaxed mb-3">{product.desc}</p>
            {product.author && (
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px] mb-6">Cadastrado por {product.author}</p>
            )}
            <button onClick={() => { if (product.stock > 0) { addToCart(product.id, 1); setOpenProductId(null); } }}
              disabled={product.stock === 0}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: product.stock === 0 ? "#D6D6D6" : "#000000", color: product.stock === 0 ? "#707070" : "#FFFFFF", fontFamily: "Inter" }}>
              {product.stock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
            </button>
            {product.authorUid === me.uid && (
              <div className="flex gap-2.5 mt-2.5">
                <button onClick={() => openEditProduct(product)}
                  className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px] active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", color: "#4D4D4D", fontFamily: "Inter", border: "1px solid #D6D6D6" }}>
                  Editar item
                </button>
                <button onClick={() => setDeleteConfirmProduct(product)}
                  className="w-14 py-3.5 rounded-full flex items-center justify-center active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", border: "1px solid #D6D6D6" }}>
                  <Trash2 size={16} color="#B33B3B" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={closeAddSheet}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-4">{editingProductId ? "Editar item" : "Novo item"}</p>

            <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11.5px] mb-2">Fotos do produto (pode adicionar várias)</p>
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
                <ShoppingBag size={18} color="#9E9E9E" />
                <input type="file" accept="image/*" multiple onChange={handlePhotoPick} className="hidden" />
              </label>
            </div>

            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do item"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex gap-3 mb-3">
              <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Preço (ex: 8,00)" inputMode="decimal"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value.replace(/\D/g, "") })} placeholder="Qtd. disponível" inputMode="numeric"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            </div>
            <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "") })} placeholder="Seu WhatsApp (ex: 81996840938)" inputMode="numeric"
              className="w-full px-4 py-3 rounded-xl mb-1 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px] mb-3">Pedidos desse item vão direto pro seu WhatsApp. Se deixar em branco, vai pro número padrão da {title}.</p>
            <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Descrição" rows={3}
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px] resize-none"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(c => (
                <button key={c} onClick={() => setForm({ ...form, category: c })}
                  className="px-3 py-1.5 rounded-full text-[11px]"
                  style={{ fontFamily: "Inter", background: form.category === c ? accent : "#FFFFFF", color: form.category === c ? "#F2F2F2" : "#4D4D4D", border: `1px solid ${form.category === c ? accent : "#D6D6D6"}` }}>
                  {c}
                </button>
              ))}
            </div>
            {!editingProductId && (
              <label className="flex items-center gap-2.5 mb-4 cursor-pointer">
                <input type="checkbox" checked={postToFeed} onChange={e => setPostToFeed(e.target.checked)}
                  className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
                <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Publicar essa novidade no Feed também</span>
              </label>
            )}
            {formError && (
              <p style={{ fontFamily: "Inter", color: "#8A8A8A" }} className="text-[12px] mb-4 text-center">{formError}</p>
            )}
            <button onClick={handleAddProduct}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              {editingProductId ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </div>
      )}

      {deleteConfirmProduct && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setDeleteConfirmProduct(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Excluir "{deleteConfirmProduct.name}"?</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-5">Não tem como desfazer depois.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D", border: "1px solid #D6D6D6" }}>
                Cancelar
              </button>
              <button onClick={confirmDeleteProduct}
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

export default ShopScreen;
