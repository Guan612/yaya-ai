import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApiStore from "../../store/apistore"; // 确保路径正确
import { toast } from "sonner";

export default function useModelProvider() {
  // 1. 从 Zustand store 中获取全局状态和设置函数
  const { api, setApi, clearApi } = useApiStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: api,
  });

  const onSave = (data) => {
    // 直接调用 zustand 的 action 来保存数据
    setApi(data);
    toast.success("保存成功");
  };

  const onClear = () => {
    clearApi();
    toast.success("清除成功");
  };

  useEffect(() => {
    reset(api);
  }, [api, reset]);

  return {
    register,
    handleSubmit,
    onSave,
    onClear,
  };
}
