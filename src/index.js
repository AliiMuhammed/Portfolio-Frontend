import React from "react";
import { RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { routes } from "./Router";
import store from "./Redux/store";
import App from "./App";
import "./Style/index.css";
import 'swiper/css/bundle';

const root = createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <RouterProvider router={routes}>
      <App />
    </RouterProvider>
  </Provider>
);
