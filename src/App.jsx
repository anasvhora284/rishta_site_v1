import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home/home.page";
import Filter from "./pages/filter/filter.page";

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
    element: <Filter />,
  },
]);

export default router;
