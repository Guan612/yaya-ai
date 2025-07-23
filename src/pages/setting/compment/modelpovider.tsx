import useModelProvider from "../../../hooks/setting/usemodelpovider";

export default function ModelProvider() {
  const { register, handleSubmit, onSave, onClear } = useModelProvider();
  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-2">
      <form onSubmit={handleSubmit(onSave)}>
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xl mx-2">
              请输入api key
            </legend>
            <input
              type="text"
              placeholder="sk-..."
              className="input w-full"
              {...register("apiKey", { required: "API Key 不能为空" })}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xl mx-2">
              请输入api url
            </legend>
            <input
              type="text"
              placeholder="https://api.example.com/v1"
              className="input w-full"
              {...register("apiUrl")}
            />
          </fieldset>
        </div>
        <div className="flex justify-around">
          <button className="btn btn-primary w-1/4" type="submit">
            保存
          </button>
          <button
            className="btn btn-error w-1/4"
            type="button"
            onClick={onClear}
          >
            清除配置
          </button>
        </div>
      </form>
    </div>
  );
}
