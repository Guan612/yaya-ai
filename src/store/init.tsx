import useApiStore from "./apistore";
import useModelStore from "./modelstore";

export const initializeAppState = () => {
  console.log("初始化中");
  useApiStore.getState().initializeApi();
  useModelStore.getState().initializeApi();
};