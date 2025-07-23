import { createBrowserRouter} from "react-router";
import Layout from "../pages/layout";
import Home from "../pages/home";
import Me from "../pages/me";
import About from "../pages/about";
import Setting from "../pages/setting";
import ModelProvider from "../pages/setting/compment/modelpovider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/me",
        element: <Me />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/setting/modelporvider",
        element: <ModelProvider />,
      },
      {
        path: "/about",
        element: <About />,
      },
    ],
  },
]);

export default router;
