import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import {
  BookOpen,
  Clapperboard,
  HandCoins,
  Home,
  ShoppingBag
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, deleteField, collection, query, where, orderBy, limit, onSnapshot, addDoc, arrayUnion, arrayRemove, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import { FeedContext, UserContext, StoryContext, ConnectionsContext, NotificationsContext, ShortsContext, LiveContext, ThemeContext, ChatUnreadContext, UsersDirectoryContext, ProfileNavContext } from "./context/contexts.js";
import { loadTheme, saveTheme } from "./utils/themeStore.js";
import { timeAgo } from "./utils/helpers.js";
import { FONTS, LIVE_STREAM_ACTIVE } from "./data/constants.js";
import { sendConnectionRequest, respondConnectionRequest, cancelConnectionRequest } from "./utils/connectionActions.js";
import StubScreen from "./components/StubScreen.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import Intro from "./screens/Intro.jsx";

// Todas as outras telas só carregam quando a pessoa realmente abre aquele
// menu — em vez de tudo vir junto no primeiro carregamento do app, o que
// deixava a entrada bem mais lenta.
const BibliaScreen = React.lazy(() => import("./screens/BibliaScreen.jsx"));
const CalendarioScreen = React.lazy(() => import("./screens/CalendarioScreen.jsx"));
const CantinaScreen = React.lazy(() => import("./screens/CantinaScreen.jsx"));
const ChatScreen = React.lazy(() => import("./screens/ChatScreen.jsx"));
const DiscipuladoScreen = React.lazy(() => import("./screens/DiscipuladoScreen.jsx"));
const EnquetesScreen = React.lazy(() => import("./screens/EnquetesScreen.jsx"));
const EstudosScreen = React.lazy(() => import("./screens/EstudosScreen.jsx"));
const EvangelismoScreen = React.lazy(() => import("./screens/EvangelismoScreen.jsx"));
const FeedScreen = React.lazy(() => import("./screens/FeedScreen.jsx"));
const InfantilScreen = React.lazy(() => import("./screens/InfantilScreen.jsx"));
const MinisteriosScreen = React.lazy(() => import("./screens/MinisteriosScreen.jsx"));
const PerfilScreen = React.lazy(() => import("./screens/PerfilScreen.jsx"));
const SouNovoScreen = React.lazy(() => import("./screens/SouNovoScreen.jsx"));
const NovoConvertidoScreen = React.lazy(() => import("./screens/NovoConvertidoScreen.jsx"));
const AniversariantesScreen = React.lazy(() => import("./screens/AniversariantesScreen.jsx"));
const StoreScreen = React.lazy(() => import("./screens/StoreScreen.jsx"));
const TransmissaoScreen = React.lazy(() => import("./screens/TransmissaoScreen.jsx"));
const ShortsScreen = React.lazy(() => import("./screens/ShortsScreen.jsx"));
const OfertasDizimosScreen = React.lazy(() => import("./screens/OfertasDizimosScreen.jsx"));
const DoacoesScreen = React.lazy(() => import("./screens/DoacoesScreen.jsx"));
const LocalizacaoScreen = React.lazy(() => import("./screens/LocalizacaoScreen.jsx"));
const OracaoScreen = React.lazy(() => import("./screens/OracaoScreen.jsx"));
const GRScreen = React.lazy(() => import("./screens/GRScreen.jsx"));
const FundamentosScreen = React.lazy(() => import("./screens/FundamentosScreen.jsx"));
const AmigosScreen = React.lazy(() => import("./screens/AmigosScreen.jsx"));
const NotificationsScreen = React.lazy(() => import("./screens/NotificationsScreen.jsx"));
const AdminScreen = React.lazy(() => import("./screens/AdminScreen.jsx"));
const PersonProfileScreen = React.lazy(() => import("./screens/PersonProfileScreen.jsx"));

function App() {
  const [stage, setStage] = useState("loading"); // loading | intro | auth | app
  const [currentUser, setCurrentUser] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(60));
    const unsub = onSnapshot(q, snap => {
      setFeedPosts(snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, time: timeAgo(data.createdAt) };
      }));
    }, () => {});
    return () => unsub();
  }, []);

  const addFeedPost = async ({ author, authorUid, text, image, images, imagePositions, video, musicName, musicUrl, kind }) => {
    const imgs = images && images.length ? images : (image ? [image] : []);
    await addDoc(collection(db, "posts"), {
      author, authorUid: authorUid || currentUser?.uid || null, text: text || "", image: imgs[0] || null, images: imgs, imagePositions: imagePositions || [], video: video || null,
      musicName: musicName || "", musicUrl: musicUrl || null, kind: kind || null, likes: [], comments: [], saved: [],
      createdAt: serverTimestamp(),
    });
  };

  const toggleFeedLike = async (postId, name) => {
    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;
    const liked = post.likes.includes(name);
    await updateDoc(doc(db, "posts", postId), { likes: liked ? arrayRemove(name) : arrayUnion(name) });
  };
  const likeFeedPost = async (postId, name) => {
    const post = feedPosts.find(p => p.id === postId);
    if (!post || post.likes.includes(name)) return;
    await updateDoc(doc(db, "posts", postId), { likes: arrayUnion(name) });
  };
  const toggleFeedSave = async (postId, name) => {
    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;
    const saved = (post.saved || []).includes(name);
    await updateDoc(doc(db, "posts", postId), { saved: saved ? arrayRemove(name) : arrayUnion(name) });
  };
  const addFeedComment = async (postId, comment) => {
    await updateDoc(doc(db, "posts", postId), { comments: arrayUnion(comment) });
  };
  const deleteFeedPost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (err) {
      console.error("POST_DELETE_ERR", err.code, err.message);
    }
  };

  const [stories, setStories] = useState([]);
  const [viewedStoryIds, setViewedStoryIds] = useState(new Set());
  useEffect(() => {
    const cutoff = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
    const q = query(collection(db, "stories"), where("createdAt", ">", cutoff), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setStories(snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, time: timeAgo(data.createdAt) };
      }));
    }, () => {});
    return () => unsub();
  }, []);

  const addStory = async ({ author, image, video, text, zoom, focus, overlays, musicName, musicUrl }) => {
    const authorUid = currentUser?.uid || null;
    const optimisticId = "pending" + Date.now();
    setStories(prev => [{
      id: optimisticId, author, authorUid, image: image || null, video: video || null, text: text || "",
      zoom: zoom || 1, focus: focus || { x: 50, y: 50 }, overlays: overlays || [],
      musicName: musicName || "", musicUrl: musicUrl || null,
      createdAt: null, time: "agora",
    }, ...prev]);
    try {
      await addDoc(collection(db, "stories"), {
        author, authorUid, image: image || null, video: video || null, text: text || "",
        zoom: zoom || 1, focus: focus || { x: 50, y: 50 }, overlays: overlays || [],
        musicName: musicName || "", musicUrl: musicUrl || null,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setStories(prev => prev.filter(s => s.id !== optimisticId));
      console.error("STORY_PUBLISH_ERR", err.code, err.message);
      throw err;
    }
  };
  const markStoryViewed = (story) => {
    setViewedStoryIds(prev => new Set([...prev, story.id]));
    if (!currentUser?.uid || !story.authorUid || story.authorUid === currentUser.uid || story.id.startsWith("pending")) return;
    updateDoc(doc(db, "stories", story.id), {
      [`viewers.${currentUser.uid}`]: { name: currentUser.nome || "Visitante", at: serverTimestamp() },
    }).catch(err => console.error("STORY_VIEW_ERR", err.code, err.message));
  };
  const reactToStory = async (story, emoji) => {
    if (!currentUser?.uid || !story.authorUid || story.authorUid === currentUser.uid) return;
    const already = story.reactions?.[currentUser.uid]?.emoji === emoji;
    try {
      await updateDoc(doc(db, "stories", story.id), {
        [`reactions.${currentUser.uid}`]: already ? deleteField() : { emoji, name: currentUser.nome || "Visitante" },
      });
    } catch (err) {
      console.error("STORY_REACT_ERR", err.code, err.message);
    }
  };
  const deleteStory = async (storyId) => {
    try {
      await deleteDoc(doc(db, "stories", storyId));
    } catch (err) {
      console.error("STORY_DELETE_ERR", err.code, err.message);
    }
  };

  const [shorts, setShorts] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "shorts"), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, snap => {
      setShorts(snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, time: timeAgo(data.createdAt) };
      }));
    }, () => {});
    return () => unsub();
  }, []);

  const addShort = async ({ author, authorUid, videoId, sourceUrl, text }) => {
    await addDoc(collection(db, "shorts"), {
      author, authorUid: authorUid || currentUser?.uid || null, videoId, sourceUrl: sourceUrl || null, text: text || "",
      likes: [], comments: [], saved: [], createdAt: serverTimestamp(),
    });
  };
  const toggleShortLike = async (shortId, name) => {
    const s = shorts.find(x => x.id === shortId);
    if (!s) return;
    const liked = s.likes.includes(name);
    await updateDoc(doc(db, "shorts", shortId), { likes: liked ? arrayRemove(name) : arrayUnion(name) });
  };
  const likeShortOnly = async (shortId, name) => {
    const s = shorts.find(x => x.id === shortId);
    if (!s || s.likes.includes(name)) return;
    await updateDoc(doc(db, "shorts", shortId), { likes: arrayUnion(name) });
  };
  const toggleShortSave = async (shortId, name) => {
    const s = shorts.find(x => x.id === shortId);
    if (!s) return;
    const saved = (s.saved || []).includes(name);
    await updateDoc(doc(db, "shorts", shortId), { saved: saved ? arrayRemove(name) : arrayUnion(name) });
  };
  const addShortComment = async (shortId, comment) => {
    await updateDoc(doc(db, "shorts", shortId), { comments: arrayUnion(comment) });
  };
  const deleteShort = async (shortId) => {
    try {
      await deleteDoc(doc(db, "shorts", shortId));
    } catch (err) {
      console.error("SHORT_DELETE_ERR", err.code, err.message);
    }
  };

  const [connections, setConnections] = useState([]);
  useEffect(() => {
    if (!currentUser?.uid) { setConnections([]); return; }
    const q = query(collection(db, "connections"), where("participants", "array-contains", currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      setConnections(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [currentUser?.uid]);

  const sendFriendRequest = (other) => {
    if (!currentUser?.uid) return;
    sendConnectionRequest({ myUid: currentUser.uid, myName: currentUser.nome || "Visitante", otherUid: other.uid, otherName: other.nome || "Membro" }).catch(err => console.error("CONN_SEND_ERR", err.code, err.message));
  };
  const respondFriendRequest = (connection, accept) => {
    respondConnectionRequest(connection, accept).catch(err => console.error("CONN_RESPOND_ERR", err.code, err.message));
  };
  const cancelFriendRequest = (id) => {
    cancelConnectionRequest(id).catch(err => console.error("CONN_CANCEL_ERR", err.code, err.message));
  };

  const [chatHasUnread, setChatHasUnread] = useState(false);
  const [dmHasUnread, setDmHasUnread] = useState(false);
  const [groupHasUnread, setGroupHasUnread] = useState(false);
  useEffect(() => { setChatHasUnread(dmHasUnread || groupHasUnread); }, [dmHasUnread, groupHasUnread]);
  useEffect(() => {
    if (!currentUser?.uid) { setDmHasUnread(false); setGroupHasUnread(false); return; }
    const isUnread = (data) => {
      const senderUid = data.lastMessage?.senderUid;
      if (!senderUid || senderUid === currentUser.uid) return false;
      const readAtMs = data.readAt?.[currentUser.uid]?.toMillis?.() || 0;
      const updatedMs = data.updatedAt?.toMillis?.() || 0;
      return readAtMs < updatedMs;
    };
    const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      setDmHasUnread(snap.docs.some(d => isUnread(d.data())));
    }, () => {});
    const qg = query(collection(db, "chatGroups"), where("participants", "array-contains", currentUser.uid));
    const unsubG = onSnapshot(qg, snap => {
      setGroupHasUnread(snap.docs.some(d => isUnread(d.data())));
    }, () => {});
    return () => { unsub(); unsubG(); };
  }, [currentUser?.uid]);

  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (!currentUser?.uid) { setNotifications([]); return; }
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    let firstLoad = true;
    const q = query(collection(db, "notifications"), where("toUid", "==", currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      if (!firstLoad && window.Notification && Notification.permission === "granted" && document.visibilityState !== "visible") {
        snap.docChanges().forEach(change => {
          if (change.type === "added") {
            const data = change.doc.data();
            try { new Notification("Igreja do Nazareno A Casa", { body: data.text }); } catch (e) {}
          }
        });
      }
      firstLoad = false;
      const list = snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, time: timeAgo(data.createdAt), _ts: data.createdAt?.toMillis?.() || 0 };
      });
      list.sort((a, b) => b._ts - a._ts);
      setNotifications(list);
    }, () => {});
    return () => unsub();
  }, [currentUser?.uid]);

  const markAllNotificationsRead = () => {
    notifications.filter(n => !n.read).forEach(n => {
      updateDoc(doc(db, "notifications", n.id), { read: true }).catch(() => {});
    });
  };
  const addNotification = ({ text }) => {
    if (!currentUser?.uid) return;
    addDoc(collection(db, "notifications"), { toUid: currentUser.uid, text, read: false, createdAt: serverTimestamp() }).catch(() => {});
  };

  const [liveActive, setLiveActive] = useState(LIVE_STREAM_ACTIVE);

  const [theme, setThemeState] = useState(loadTheme);
  const setTheme = (t) => { setThemeState(t); saveTheme(t); };

  const [storeProducts, setStoreProducts] = useState([]);
  const [cantinaProducts, setCantinaProducts] = useState([]);
  useEffect(() => {
    const unsubStore = onSnapshot(query(collection(db, "storeProducts"), orderBy("createdAt", "desc")), snap => {
      setStoreProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    const unsubCantina = onSnapshot(query(collection(db, "cantinaProducts"), orderBy("createdAt", "desc")), snap => {
      setCantinaProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => { unsubStore(); unsubCantina(); };
  }, []);

  const addStoreProduct = (product) => addDoc(collection(db, "storeProducts"), { ...product, authorUid: currentUser?.uid || null, createdAt: serverTimestamp() });
  const updateStoreStock = (id, stock) => updateDoc(doc(db, "storeProducts", id), { stock });
  const updateStoreProduct = (id, fields) => updateDoc(doc(db, "storeProducts", id), fields);
  const deleteStoreProduct = (id) => deleteDoc(doc(db, "storeProducts", id));
  const addCantinaProduct = (product) => addDoc(collection(db, "cantinaProducts"), { ...product, authorUid: currentUser?.uid || null, createdAt: serverTimestamp() });
  const updateCantinaStock = (id, stock) => updateDoc(doc(db, "cantinaProducts", id), { stock });
  const updateCantinaProduct = (id, fields) => updateDoc(doc(db, "cantinaProducts", id), fields);
  const deleteCantinaProduct = (id) => deleteDoc(doc(db, "cantinaProducts", id));

  const [tab, setTab] = useState("inicio");
  const [openTile, setOpenTile] = useState(null);
  const [viewingProfileUid, setViewingProfileUid] = useState(null);
  const openProfile = (uid) => { if (!uid) return; setViewingProfileUid(uid); setOpenTile("profile"); };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        setCurrentUser({ uid: fbUser.uid, email: fbUser.email, ...(snap.exists() ? snap.data() : {}) });
        setStage("app");
      } else {
        setCurrentUser(null);
        setStage(prev => (prev === "app" || prev === "loading") ? "intro" : prev);
      }
    });
    return () => unsub();
  }, []);

  // Diretorio de usuarios sob demanda: em vez de escutar a colecao "users" inteira
  // (o que le todo mundo, toda sessao, mesmo so pra mostrar 3 avatares na tela),
  // busca so o perfil de quem realmente aparece, uma vez, e guarda em cache.
  const [usersByUid, setUsersByUid] = useState({});
  const fetchedUidsRef = useRef(new Set());
  useEffect(() => { fetchedUidsRef.current = new Set(); setUsersByUid({}); }, [currentUser?.uid]);
  const ensureUserLoaded = (uid) => {
    if (!uid || fetchedUidsRef.current.has(uid)) return;
    fetchedUidsRef.current.add(uid);
    getDoc(doc(db, "users", uid)).then(snap => {
      if (snap.exists()) setUsersByUid(prev => ({ ...prev, [uid]: snap.data() }));
    }).catch(() => {});
  };

  const navItems = [
    { id: "biblia", icon: BookOpen, label: "Bíblia" },
    { id: "shorts", icon: Clapperboard, label: "Shorts" },
    { id: "inicio", icon: Home, label: "Casa" },
    { id: "store", icon: ShoppingBag, label: "Casa Store" },
    { id: "ofertas", icon: HandCoins, label: "Generosidade" },
  ];

  const updateUserPhoto = (photo) => {
    setCurrentUser(prev => prev ? { ...prev, photo } : prev);
    if (currentUser?.uid) {
      updateDoc(doc(db, "users", currentUser.uid), { photo, role: currentUser.role || "member" })
        .catch(err => console.error("PHOTO_SAVE_ERR", err.code, err.message));
    }
  };

  const updateUserName = (nome) => {
    setCurrentUser(prev => prev ? { ...prev, nome } : prev);
    if (currentUser?.uid) {
      updateDoc(doc(db, "users", currentUser.uid), { nome, role: currentUser.role || "member" })
        .catch(err => console.error("NAME_SAVE_ERR", err.code, err.message));
    }
  };

  const updateUserBio = (bio) => {
    setCurrentUser(prev => prev ? { ...prev, bio } : prev);
    if (currentUser?.uid) {
      updateDoc(doc(db, "users", currentUser.uid), { bio, role: currentUser.role || "member" })
        .catch(err => console.error("BIO_SAVE_ERR", err.code, err.message));
    }
  };

  const updateUserProfissao = (profissao) => {
    setCurrentUser(prev => prev ? { ...prev, profissao } : prev);
    if (currentUser?.uid) {
      updateDoc(doc(db, "users", currentUser.uid), { profissao, role: currentUser.role || "member" })
        .catch(err => console.error("PROFISSAO_SAVE_ERR", err.code, err.message));
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setTab("inicio");
    setOpenTile(null);
  };

  return (
    <div className="w-full min-h-[100svh] flex items-center justify-center" style={{ background: "#0E1120" }}>
      <style>{FONTS}</style>
      <div data-theme={theme} className="relative w-full h-[100svh] overflow-hidden sm:w-[375px] sm:h-[780px] sm:rounded-[2.5rem] sm:border-[8px] sm:border-black" style={{ background: "#000000", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", transform: "translateZ(0)" }}>
        {stage === "loading" ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#000000" }} />
        ) : stage === "intro" ? (
          <Intro onStart={() => setStage("auth")} />
        ) : stage === "auth" ? (
          <AuthScreen onSuccess={(user) => { setCurrentUser(user); setStage("app"); }} />
        ) : (
          <UserContext.Provider value={{ uid: currentUser?.uid || null, name: currentUser?.nome || "Visitante", email: currentUser?.email || "", profissao: currentUser?.profissao || "", nascimento: currentUser?.nascimento || "", photo: currentUser?.photo || null, bio: currentUser?.bio || "", role: currentUser?.role || "member", setPhoto: updateUserPhoto, setName: updateUserName, setBio: updateUserBio, setProfissao: updateUserProfissao }}>
          <UsersDirectoryContext.Provider value={{ byUid: usersByUid, ensureUser: ensureUserLoaded }}>
          <ProfileNavContext.Provider value={{ openProfile }}>
          <FeedContext.Provider value={{ posts: feedPosts, addPost: addFeedPost, toggleLike: toggleFeedLike, likePost: likeFeedPost, toggleSave: toggleFeedSave, addComment: addFeedComment, deletePost: deleteFeedPost }}>
          <StoryContext.Provider value={{ stories, viewedIds: viewedStoryIds, addStory, markViewed: markStoryViewed, reactToStory, deleteStory }}>
          <ShortsContext.Provider value={{ shorts, addShort, toggleLike: toggleShortLike, likeOnly: likeShortOnly, toggleSave: toggleShortSave, addComment: addShortComment, deleteShort }}>
          <ConnectionsContext.Provider value={{ connections, sendRequest: sendFriendRequest, respond: respondFriendRequest, cancelSent: cancelFriendRequest }}>
          <ChatUnreadContext.Provider value={{ hasUnread: chatHasUnread }}>
          <NotificationsContext.Provider value={{ notifications, markAllRead: markAllNotificationsRead, addNotification }}>
          <LiveContext.Provider value={{ liveActive, setLiveActive }}>
          <ThemeContext.Provider value={{ theme, setTheme }}>
          <div className="flex flex-col h-full">
            <React.Suspense fallback={<div className="flex-1" style={{ background: "var(--c-bg)" }} />}>
            {openTile === "biblia" || (tab === "biblia" && !openTile) ? (
              <BibliaScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "plano" || (tab === "plano" && !openTile) ? (
              <BibliaScreen initialSection="plano" onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "discipulado" || (tab === "discipulado" && !openTile) ? (
              <DiscipuladoScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "ministerios" || (tab === "ministerios" && !openTile) ? (
              <MinisteriosScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "store" || (tab === "store" && !openTile) ? (
              <StoreScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} products={storeProducts} addProduct={addStoreProduct} updateStock={updateStoreStock} updateProduct={updateStoreProduct} deleteProduct={deleteStoreProduct} />
            ) : openTile === "cantina" || (tab === "cantina" && !openTile) ? (
              <CantinaScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} products={cantinaProducts} addProduct={addCantinaProduct} updateStock={updateCantinaStock} updateProduct={updateCantinaProduct} deleteProduct={deleteCantinaProduct} />
            ) : openTile === "feed" || (tab === "feed" && !openTile) ? (
              <FeedScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "chat" || (tab === "chat" && !openTile) ? (
              <ChatScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "estudo" || (tab === "estudo" && !openTile) ? (
              <EstudosScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "infantil" || (tab === "infantil" && !openTile) ? (
              <InfantilScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "calendario" || (tab === "calendario" && !openTile) ? (
              <CalendarioScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "enquetes" || (tab === "enquetes" && !openTile) ? (
              <EnquetesScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "evangelismo" || (tab === "evangelismo" && !openTile) ? (
              <EvangelismoScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "sounovo" || (tab === "sounovo" && !openTile) ? (
              <SouNovoScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "novoconvertido" || (tab === "novoconvertido" && !openTile) ? (
              <NovoConvertidoScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "transmissao" || (tab === "transmissao" && !openTile) ? (
              <TransmissaoScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "shorts" || (tab === "shorts" && !openTile) ? (
              <ShortsScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "ofertas" || (tab === "ofertas" && !openTile) ? (
              <OfertasDizimosScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "doacoes" || (tab === "doacoes" && !openTile) ? (
              <DoacoesScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "localizacao" || (tab === "localizacao" && !openTile) ? (
              <LocalizacaoScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "oracao" || (tab === "oracao" && !openTile) ? (
              <OracaoScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "gr" || (tab === "gr" && !openTile) ? (
              <GRScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "fundamentos" || (tab === "fundamentos" && !openTile) ? (
              <FundamentosScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "amigos" || (tab === "amigos" && !openTile) ? (
              <AmigosScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "amigos-solicitacoes" ? (
              <AmigosScreen initialTab="solicitacoes" onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "aniversariantes" || (tab === "aniversariantes" && !openTile) ? (
              <AniversariantesScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "notificacoes" ? (
              <NotificationsScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "admin" ? (
              <AdminScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "profile" ? (
              <PersonProfileScreen uid={viewingProfileUid} onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : openTile === "perfil" || (tab === "perfil" && !openTile) ? (
              <PerfilScreen onBack={() => { setOpenTile(null); setTab("inicio"); }} onLogout={handleLogout} />
            ) : openTile ? (
              <StubScreen tabId={openTile} onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            ) : tab === "inicio" ? (
              <HomeScreen onOpenTile={(id) => { setOpenTile(id); setTab(id); }} />
            ) : (
              <StubScreen tabId={tab} onBack={() => { setOpenTile(null); setTab("inicio"); }} />
            )}
            </React.Suspense>
            <div className="flex items-stretch py-2 px-1" style={{ background: "var(--c-surface)", borderTop: "1px solid var(--c-divider)" }}>
              {navItems.map(n => {
                const active = tab === n.id && !openTile;
                return (
                  <button key={n.id} onClick={() => { setTab(n.id); setOpenTile(n.id === "inicio" ? null : n.id); }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl min-w-0" style={{ background: active ? "var(--c-active-bg)" : "transparent" }}>
                    <n.icon size={19} color={active ? "var(--c-accent-2)" : "var(--c-faint)"} />
                    <span style={{ fontFamily: "Inter", color: active ? "var(--c-text)" : "var(--c-faint)", fontWeight: active ? 600 : 400 }} className="text-[9px] truncate max-w-full">{n.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </ThemeContext.Provider>
          </LiveContext.Provider>
          </NotificationsContext.Provider>
          </ChatUnreadContext.Provider>
          </ConnectionsContext.Provider>
          </ShortsContext.Provider>
          </StoryContext.Provider>
          </FeedContext.Provider>
          </ProfileNavContext.Provider>
          </UsersDirectoryContext.Provider>
          </UserContext.Provider>
        )}
      </div>
    </div>
  );
}


export default App;
