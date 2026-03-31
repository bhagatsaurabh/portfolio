import { useEffect } from "react";

const requestIdleCB = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1));
const cancelIdleCB = window.cancelIdleCallback ?? ((id) => clearTimeout(id));

export const useIdlePreload = (imports) => {
  useEffect(() => {
    const preload = async () => {
      await Promise.all(imports.map((fn) => fn()));
    };
    const handle = requestIdleCB(preload);

    return () => cancelIdleCB(handle);
  }, [imports]);
};

export default useIdlePreload;
