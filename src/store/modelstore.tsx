import { create } from "zustand";
import { LazyStore } from "@tauri-apps/plugin-store";

const modelStore = new LazyStore("model.settings.dat");

const useModelStore = create((set) => ({
  defualtmodel: "",
  models: [],
  isLoading: true,
  initializeApi: async () => {
    try {
      const savedApi = await modelStore.get("models");
      if (savedApi) {
        set({ model: savedApi });
      }
    } catch (error) {
      console.error("Failed to initialize API store:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setModels: async (models: string[]) => {
    set({ models: models });
    await modelStore.set("models", models);
    await modelStore.save;
  },

  setDefualModel: async (model: string) => {
    set({ defualtmodel: model });
    await modelStore.set("defualtmodel", model);
    await modelStore.save;
  },
}));

export default useModelStore;
