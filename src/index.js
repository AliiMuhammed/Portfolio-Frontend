import React from "react";
import { RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { routes } from "./Router";
import store from "./Redux/store";
import "./Style/index.css";

const beforeSend = (event) => {
  const url = new URL(event.url);
  url.search = "";
  url.hash = "";
  return { ...event, url: url.href };
};

const root = createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <RouterProvider router={routes} />
    <Analytics beforeSend={beforeSend} />
    <SpeedInsights beforeSend={beforeSend} />
  </Provider>
);
