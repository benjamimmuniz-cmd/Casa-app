import React, { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { GR_COLORS } from "../data/constants.js";
import GroupNetworkScreen from "../components/GroupNetworkScreen.jsx";

function GRScreen({ onBack }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "grGroups"), snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  const addGroup = (group) => {
    addDoc(collection(db, "grGroups"), { ...group, createdAt: serverTimestamp() })
      .catch(err => console.error("GR_ADD_ERR", err.code, err.message));
  };
  const updateGroupTree = (id, leader) => {
    updateDoc(doc(db, "grGroups", id), { leader })
      .catch(err => console.error("GR_UPDATE_ERR", err.code, err.message));
  };
  const deleteGroup = (id) => {
    deleteDoc(doc(db, "grGroups", id))
      .catch(err => console.error("GR_DELETE_ERR", err.code, err.message));
  };

  return (
    <GroupNetworkScreen
      onBack={onBack}
      title="Grupos de Relacionamentos"
      itemLabel="GR"
      itemPlaceholder="Ex: GR Jardim das Flores"
      linkPrefix="gr"
      icon={UsersRound}
      palette={GR_COLORS}
      groups={groups}
      addGroup={addGroup}
      updateGroupTree={updateGroupTree}
      deleteGroup={deleteGroup}
    />
  );
}

export default GRScreen;
