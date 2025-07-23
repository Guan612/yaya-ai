import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import router from "./router";

function App() {
  return (
    <div>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
