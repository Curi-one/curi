import { useCallback, useEffect, useState } from "react";
import {
  createCatalogItem,
  loadCatalog,
  resetCatalog,
  saveCatalog,
} from "@/lib/admin-catalog";

export function useAdminCatalog() {
  const [items, setItems] = useState(() => loadCatalog());

  useEffect(() => {
    saveCatalog(items);
  }, [items]);

  const updateItem = useCallback((id, patch) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, []);

  const addItem = useCallback((type, partial) => {
    const item = createCatalogItem(type, partial);
    setItems((prev) => [...prev, item]);
    return item;
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    setItems(resetCatalog());
  }, []);

  return { items, setItems, updateItem, addItem, removeItem, reset };
}
