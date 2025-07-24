import OpenAI from "openai";
import useApiStore from "../store/apistore";
import useModelStore from "../store/modelstore";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useCallback, useMemo } from "react";

export default function useOpenai() {
  const navigate = useNavigate();
  const { api } = useApiStore();
  const { setModels, setDefualModel } = useModelStore();

  // 使用 useMemo 缓存 openai 实例
  // 只有当 apiKey 或 apiUrl 变化时，才会重新创建
  const openai = useMemo(() => {
    return new OpenAI({
      apiKey: api.apiKey,
      baseURL: api.apiUrl,
      dangerouslyAllowBrowser: true,
    });
  }, [api.apiKey, api.apiUrl]);

  const getModelList = useCallback(async () => {
    // 如果 openai 实例的 key 是空的，提前返回，避免无效请求
    if (!openai.apiKey) {
      toast.error("API Key 为空，无法获取模型。");
      navigate("/setting/modelporvider");
      return;
    }
    try {
      const response = await openai.models.list();
      setModels(response.data);
      return response.data;
    } catch (error) {
      console.error("获取模型列表失败:", error);
      // 可以在这里弹出 toast 错误提示
      toast.error("获取模型列表失败，请检查API设置和网络连接。");
    }
  }, [openai]); // 依赖 openai 实例

  return {
    getModelList,
  };
}
