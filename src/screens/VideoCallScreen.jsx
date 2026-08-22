import React, { useContext, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { doc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, onSnapshot, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { getChatId } from "../utils/chatId.js";
import { colorFor, initials } from "../utils/helpers.js";

const ROOM_ID = "estudos-geral";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function VideoTile({ name, stream, muted }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream || null;
  }, [stream]);
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "#1A1A1A", aspectRatio: "3/4" }}>
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: colorFor(name) }}>
          <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[20px]">{initials(name)}</span>
        </div>
      )}
      <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-full text-[10px]" style={{ fontFamily: "Inter", background: "rgba(0,0,0,0.5)", color: "#F2F2F2" }}>{name}</span>
    </div>
  );
}

function VideoCallScreen({ onBack }) {
  const me = useContext(UserContext);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [participantNames, setParticipantNames] = useState({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [localStreamTick, setLocalStreamTick] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const knownPeersRef = useRef(new Set());
  const offerCandCountRef = useRef({});
  const answerCandCountRef = useRef({});

  const createPeerConnection = (otherUid) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    localStreamRef.current?.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
    pc.ontrack = (e) => setRemoteStreams(prev => ({ ...prev, [otherUid]: e.streams[0] }));
    peersRef.current[otherUid] = pc;
    return pc;
  };

  const startAsOfferer = async (otherUid) => {
    const pairId = getChatId(me.uid, otherUid);
    const pc = createPeerConnection(otherUid);
    pc.onicecandidate = (e) => {
      if (e.candidate) updateDoc(doc(db, "studySignals", pairId), { offerCandidates: arrayUnion(e.candidate.toJSON()) }).catch(() => {});
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await setDoc(doc(db, "studySignals", pairId), {
      participants: [me.uid, otherUid], offererUid: me.uid,
      offer: { sdp: offer.sdp, type: offer.type },
      offerCandidates: [], answer: null, answerCandidates: [],
    });
  };

  const handleSignalUpdate = async (pairId, otherUid, data) => {
    const amOfferer = data.offererUid === me.uid;
    let pc = peersRef.current[otherUid];

    if (!amOfferer && data.offer && !pc) {
      pc = createPeerConnection(otherUid);
      pc.onicecandidate = (e) => {
        if (e.candidate) updateDoc(doc(db, "studySignals", pairId), { answerCandidates: arrayUnion(e.candidate.toJSON()) }).catch(() => {});
      };
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await updateDoc(doc(db, "studySignals", pairId), { answer: { sdp: answer.sdp, type: answer.type } });
    }

    if (amOfferer && data.answer && pc && !pc.currentRemoteDescription) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    if (pc) {
      const candField = amOfferer ? "answerCandidates" : "offerCandidates";
      const countRef = amOfferer ? answerCandCountRef : offerCandCountRef;
      const already = countRef.current[pairId] || 0;
      const list = data[candField] || [];
      for (let i = already; i < list.length; i++) {
        try { await pc.addIceCandidate(new RTCIceCandidate(list[i])); } catch (e) {}
      }
      countRef.current[pairId] = list.length;
    }
  };

  useEffect(() => {
    if (!joined) return;
    const roomRef = doc(db, "studyRooms", ROOM_ID);
    const unsubRoom = onSnapshot(roomRef, snap => {
      const data = snap.data() || {};
      setParticipantNames(data.participantNames || {});
      const uids = data.participants || [];
      uids.forEach(uid => {
        if (uid === me.uid || knownPeersRef.current.has(uid)) return;
        knownPeersRef.current.add(uid);
        if (me.uid < uid) startAsOfferer(uid);
      });
      Object.keys(peersRef.current).forEach(uid => {
        if (!uids.includes(uid)) {
          peersRef.current[uid]?.close();
          delete peersRef.current[uid];
          knownPeersRef.current.delete(uid);
          setRemoteStreams(prev => { const n = { ...prev }; delete n[uid]; return n; });
        }
      });
    });

    const q = query(collection(db, "studySignals"), where("participants", "array-contains", me.uid));
    const unsubSignals = onSnapshot(q, snap => {
      snap.docChanges().forEach(change => {
        const data = change.doc.data();
        const otherUid = data.participants.find(u => u !== me.uid);
        if (otherUid) handleSignalUpdate(change.doc.id, otherUid, data);
      });
    });

    return () => { unsubRoom(); unsubSignals(); };
  }, [joined]);

  const joinCall = async () => {
    setJoinError("");
    setJoining(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStreamTick(t => t + 1);
      const roomRef = doc(db, "studyRooms", ROOM_ID);
      await setDoc(roomRef, { participants: arrayUnion(me.uid) }, { merge: true });
      await updateDoc(roomRef, { [`participantNames.${me.uid}`]: me.name });
      setJoined(true);
    } catch (err) {
      console.error("CALL_JOIN_ERR", err.message);
      setJoinError("Não deu pra acessar câmera/microfone. Verifica as permissões do navegador.");
    } finally {
      setJoining(false);
    }
  };

  const leaveCall = async () => {
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    knownPeersRef.current = new Set();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setRemoteStreams({});
    setJoined(false);
    if (me.uid) {
      updateDoc(doc(db, "studyRooms", ROOM_ID), { participants: arrayRemove(me.uid) }).catch(() => {});
      const q = query(collection(db, "studySignals"), where("participants", "array-contains", me.uid));
      getDocs(q).then(snap => snap.docs.forEach(d => deleteDoc(d.ref).catch(() => {}))).catch(() => {});
    }
  };

  useEffect(() => () => { if (localStreamRef.current) leaveCall(); }, []);

  const toggleMute = () => {
    const next = !muted;
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !next; });
    setMuted(next);
  };
  const toggleCamera = () => {
    const next = !cameraOff;
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !next; });
    setCameraOff(next);
  };

  const otherUids = Object.keys(participantNames).filter(uid => uid !== me.uid);

  if (!joined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center" style={{ background: "#000000" }}>
        <button onClick={onBack} className="absolute top-6 left-6 text-[13px]" style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }}>← Estudos</button>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(242,242,242,0.1)" }}>
          <Video size={26} color="#F2F2F2" />
        </div>
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[20px] mb-2">Chamada de vídeo do grupo</h1>
        <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.65)" }} className="text-[13px] leading-relaxed mb-6">
          Todo mundo que entrar aqui cai na mesma sala, junto com quem já estiver na chamada.
        </p>
        {joinError && <p style={{ fontFamily: "Inter", color: "#E15B4A" }} className="text-[12px] mb-4">{joinError}</p>}
        <button onClick={joinCall} disabled={joining}
          className="px-6 py-3.5 rounded-full font-semibold text-[14px]" style={{ fontFamily: "Inter", background: "#F2F2F2", color: "#000000", opacity: joining ? 0.6 : 1 }}>
          {joining ? "Entrando..." : "Entrar na chamada"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col" style={{ background: "#000000" }}>
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[15px]">Chamada — Estudos</p>
        <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "Inter", background: "rgba(242,242,242,0.1)", color: "#F2F2F2" }}>
          <Users size={12} /> {otherUids.length + 1}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          <VideoTile name={`${me.name} (você)`} stream={localStreamRef.current} muted />
          {otherUids.map(uid => (
            <VideoTile key={uid} name={participantNames[uid] || "Alguém"} stream={remoteStreams[uid]} muted={false} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pb-8 pt-2">
        <button onClick={toggleMute} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: muted ? "#F2F2F2" : "rgba(242,242,242,0.15)" }}>
          {muted ? <MicOff size={19} color="#000000" /> : <Mic size={19} color="#F2F2F2" />}
        </button>
        <button onClick={leaveCall} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#B33B3B" }}>
          <PhoneOff size={22} color="#FFFFFF" />
        </button>
        <button onClick={toggleCamera} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: cameraOff ? "#F2F2F2" : "rgba(242,242,242,0.15)" }}>
          {cameraOff ? <VideoOff size={19} color="#000000" /> : <Video size={19} color="#F2F2F2" />}
        </button>
      </div>
    </div>
  );
}

export default VideoCallScreen;
