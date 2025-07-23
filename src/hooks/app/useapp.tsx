import { useEffect } from "react";
import { initializeAppState } from "../../store/init";

export default function useApp() {
  useEffect(() => {
    initializeAppState();
  }, []);
}
