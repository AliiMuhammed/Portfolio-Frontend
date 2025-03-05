import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./Pages/Home/Home";
import ContactMe from "./Pages/ContactMe/ContactMe";
import NotFound from "./Pages/NotFound/NotFound";
import Resume from "./Pages/Resume/Resume";
import Work from "./Pages/Work/Work";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/contact",
        element: <ContactMe />,
      },
      {
        path: "/resume",
        element: <Resume />,
      },
      {
        path: "/work",
        element: <Work />,
      },
    ],
    errorElement: <NotFound />,
  },
]);
