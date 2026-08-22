import React, { useState, useEffect, useContext, createContext } from "react";
import { CATEGORIES_STORE, STORE_WHATSAPP } from "../data/constants.js";
import ShopScreen from "./ShopScreen.jsx";

function StoreScreen({ onBack, products, addProduct, updateStock, updateProduct, deleteProduct }) {
  return <ShopScreen onBack={onBack} title="Casa Store" subtitle="Produtos e materiais da igreja"
    products={products} addProduct={addProduct} updateStock={updateStock} updateProduct={updateProduct} deleteProduct={deleteProduct} categories={CATEGORIES_STORE} accent="#8A8A8A" waNumber={STORE_WHATSAPP} layout="grid" />;
}

export default StoreScreen;
