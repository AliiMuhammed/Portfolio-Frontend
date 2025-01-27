import React from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./Router";
import App from "./App";
import { createRoot } from 'react-dom/client';
import './Style/index.css';

const root = createRoot(document.getElementById("root"));
root.render(
 
    <RouterProvider router={routes}>
      <App />
    </RouterProvider>
  
);


