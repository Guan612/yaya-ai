import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import router from "./router";
import useApp from "./hooks/app/useapp";

function App() {
  useApp();
  return (
    <div>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
