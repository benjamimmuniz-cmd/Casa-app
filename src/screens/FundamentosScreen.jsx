import React, { useEffect, useState } from "react";
import { BookOpenCheck } from "lucide-react";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { FUNDAMENTOS_COLORS } from "../data/constants.js";
import GroupNetworkScreen from "../components/GroupNetworkScreen.jsx";

function FundamentosScreen({ onBack }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "fundamentosGroups"), snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  const addGroup = (group) => {
    addDoc(collection(db, "fundamentosGroups"), { ...group, createdAt: serverTimestamp() })
      .catch(err => console.error("FUNDAMENTOS_ADD_ERR", err.code, err.message));
  };
  const updateGroupTree = (id, leader) => {
    updateDoc(doc(db, "fundamentosGroups", id), { leader })
      .catch(err => console.error("FUNDAMENTOS_UPDATE_ERR", err.code, err.message));
  };
  const deleteGroup = (id) => {
    deleteDoc(doc(db, "fundamentosGroups", id))
      .catch(err => console.error("FUNDAMENTOS_DELETE_ERR", err.code, err.message));
  };

  return (
    <GroupNetworkScreen
      onBack={onBack}
      title="Fundamentos"
      itemLabel="Turma"
      itemPlaceholder="Ex: Turma de Fundamentos — Manhã"
      linkPrefix="fundamentos"
      icon={BookOpenCheck}
      palette={FUNDAMENTOS_COLORS}
      groups={groups}
      addGroup={addGroup}
      updateGroupTree={updateGroupTree}
      deleteGroup={deleteGroup}
    />
  );
}

export default FundamentosScreen;
