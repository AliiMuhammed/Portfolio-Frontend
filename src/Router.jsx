import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./Pages/Home/Home";
import ContactMe from "./Pages/ContactMe/ContactMe";
import NotFound from "./Pages/NotFound/NotFound";
import Resume from "./Pages/Resume/Resume";
import Work from "./Pages/Work/Work";
import CaseStudy from "./Pages/Work/CaseStudy";
import Writing from "./Pages/Writing/Writing";

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
      {path: "/work/:slug", element: <CaseStudy />},
      {path: "/writing", element: <Writing />},
      {path: "/writing/:slug", element: <Writing />},
      {
        path: "/work",
        element: <Work />,
      },
    ],
    errorElement: <NotFound />,
  },
]);
