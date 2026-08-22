import React, { useState, useEffect, useContext, createContext } from "react";
import { CANTINA_WHATSAPP, CATEGORIES_CANTINA } from "../data/constants.js";
import ShopScreen from "./ShopScreen.jsx";

function CantinaScreen({ onBack, products, addProduct, updateStock, updateProduct, deleteProduct }) {
  return <ShopScreen onBack={onBack} title="Casa Cantina" subtitle="Cardápio de hoje à noite"
    products={products} addProduct={addProduct} updateStock={updateStock} updateProduct={updateProduct} deleteProduct={deleteProduct} categories={CATEGORIES_CANTINA} accent="#2B2B2B" waNumber={CANTINA_WHATSAPP} layout="list" />;
}

export default CantinaScreen;
