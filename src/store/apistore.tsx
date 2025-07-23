import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useApiStore = create()(
  // 3. 将你原来的函数 (set) => ({...}) 整个放进 persist 中作为第一个参数
  persist(
    (set) => ({
      // 这部分是你原来的代码，保持不变
      api: { apiKey: "", apiUrl: "" },
      setApi: (apiInfo: { apiKey: string; apiUrl: string }) =>
        set({ api: apiInfo }),
      clearApi: () => set({ api: { apiKey: "", apiUrl: "" } }),
    }),
    {
      // 4. 添加 persist 的配置对象作为第二个参数，name 是必须的
      name: "api-storage", // 这个名字将作为数据在 LocalStorage 中存储的 key
    }
  )
);

export default useApiStore;
