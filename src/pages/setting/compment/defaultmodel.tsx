import useDefaultModel from "../../../hooks/setting/usedefaultmodel";

export default function DefaultModel() {
  const { models, handleSubmit, register, setModel, defualtmodel } =
    useDefaultModel();
  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-4xl mx-auto min-h-[calc(100vh-5rem)] p-2 m-2">
      <form className="card-body" onSubmit={handleSubmit(setModel)}>
        <h2 className="card-title">默认模型设置</h2>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">默认模型id</span>
          </label>
          <input
            type="text"
            placeholder="deepseek-ai/DeepSeek-V3"
            className="input input-bordered w-full"
            {...register("modelId")}
            defaultValue={defualtmodel}
          />
        </div>

        <div className="divider">或者选择一个模型作为默认模型</div>

        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {models.map((model) => (
            <div
              key={model.id}
              onClick={() => setModel(model.id)}
              className={`p-2 rounded-lg cursor-pointer ${
                defualtmodel === model.id
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200"
              }`}
            >
              {model.id}
            </div>
          ))}
        </div>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  );
}
