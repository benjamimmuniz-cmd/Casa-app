import { createContext } from "react";

export const FeedContext = createContext({ posts: [], addPost: () => {}, toggleLike: () => {}, likePost: () => {}, toggleSave: () => {}, addComment: () => {}, deletePost: () => {} });

export const StoryContext = createContext({ stories: [], viewedIds: new Set(), addStory: () => {}, markViewed: () => {}, reactToStory: () => {}, deleteStory: () => {} });

export const ConnectionsContext = createContext({ connections: [], sendRequest: () => {}, respond: () => {}, cancelSent: () => {} });

export const NotificationsContext = createContext({ notifications: [], markAllRead: () => {}, addNotification: () => {}, openNotificationLink: () => {} });

export const ChatUnreadContext = createContext({ hasUnread: false });

export const ShortsContext = createContext({ shorts: [], addShort: () => {}, toggleLike: () => {}, likeOnly: () => {}, toggleSave: () => {}, addComment: () => {}, deleteShort: () => {} });

export const LiveContext = createContext({ liveActive: false, setLiveActive: () => {} });

export const ThemeContext = createContext({ theme: "light", setTheme: () => {}, textLarge: false, setTextLarge: () => {} });

export const UserContext = createContext({ uid: null, name: "Visitante", email: "", profissao: "", telefone: "", photo: null, bio: "", setPhoto: () => {}, setName: () => {}, setBio: () => {}, setTelefone: () => {}, role: "member", notificacoesAtivas: true, setNotificacoesAtivas: () => {}, possuiCarro: false, placa: "", setPossuiCarro: () => {}, setPlaca: () => {}, createdAt: null });

// Diretório em tempo real de todo mundo cadastrado (uid -> {nome, photo}) — usado pelo
// Avatar pra mostrar a foto atual de qualquer pessoa, não só de quem está logado.
export const UsersDirectoryContext = createContext({ byUid: {}, ensureUser: () => {} });

// Navegação pro perfil de outra pessoa (uid -> abre a tela de perfil dela) — disponível
// em qualquer tela que mostre nome/foto de alguém (Feed, Stories, Amigos, Chat).
export const ProfileNavContext = createContext({ openProfile: () => {}, openMensagem: () => {}, openOracao: () => {}, openTestemunhos: () => {} });

