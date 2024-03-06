import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home/home.page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/filter",
    element: <Home />,
  },
]);

export default router;
