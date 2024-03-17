import { Navigate, createBrowserRouter } from "react-router-dom";
import Filter from "./pages/filter/filter.page";
import Listing from "./pages/listing/listing.page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to='/filter' />,
  },
  {
    path: "/filter",
    element: <Filter />,
  },
  {
    path: "/userlist",
    element: <Listing />,
  },
]);

export default router;
