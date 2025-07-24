import useModelStore from "../../store/modelstore";
import useOpenai from "../../services/openai";
import { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export default function useDefaultModel() {
   const { register, handleSubmit, setValue } = useForm();
  const { models, defualtmodel, setDefualModel } = useModelStore();
  const { getModelList } = useOpenai();

  function setModel(data) {
    setDefualModel(data);
    toast.success("设置成功");
  }

  useEffect(() => {
    getModelList();
  }, []);

  return {
    handleSubmit,
    register,
    setValue,
    setModel,
    models,
    defualtmodel,
  };
}
