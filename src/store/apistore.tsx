import { create } from "zustand";
import { LazyStore } from "@tauri-apps/plugin-store";

// 2. 创建一个 Store 实例，它会指向一个本地文件 (例如 `api.settings.dat`)
// 这个实例是我们与硬盘文件交互的桥梁
const apiStore = new LazyStore("api.settings.dat");

const useApiStore = create((set) => ({
  // --- 状态 (State) ---
  // api 状态保持不变
  api: { apiKey: "", apiUrl: "" },
  // 新增一个加载状态，用于在从硬盘读取数据时给UI一个反馈
  isLoading: true,

  // --- 操作 (Actions) ---

  /**
   * (新增) 初始化Action：从硬盘加载已保存的数据到Zustand中。
   * 这个函数必须在你的应用启动时被调用一次。
   */
  initializeApi: async () => {
    try {
      // 从硬盘文件中读取 'api' 这个键的值
      const savedApi = await apiStore.get("api");
      if (savedApi) {
        // 如果读取到了数据，就用它来更新Zustand的state
        set({ api: savedApi });
      }
    } catch (error) {
      console.error("Failed to initialize API store:", error);
    } finally {
      // 无论成功与否，最后都将加载状态设置为false
      set({ isLoading: false });
    }
  },

  /**
   * (改造) 设置API信息
   * 现在它会同时更新内存和硬盘
   */
  setApi: async (apiInfo: { apiKey: string; apiUrl: string }) => {
    // a. 立即更新内存中的状态，UI会立刻响应
    set({ api: apiInfo });

    // b. 异步地将新数据写入硬盘文件
    await apiStore.set("api", apiInfo);
    // c. 确保数据被保存到磁盘
    await apiStore.save();
    console.log("数据已确认保存到硬盘！值为:", apiInfo);
  },

  /**
   * (改造) 清除API信息
   * 同样会同时更新内存和硬盘
   */
  clearApi: async () => {
    const emptyApi = { apiKey: "", apiUrl: "" };
    // a. 更新内存状态
    set({ api: emptyApi });

    // b. 更新硬盘文件
    await apiStore.set("api", emptyApi);
    await apiStore.save();
  },
}));

export default useApiStore;
