import useApiStore from "./apistore";

export const initializeAppState = () => {
  console.log("初始化中");
  useApiStore.getState().initializeApi();
};