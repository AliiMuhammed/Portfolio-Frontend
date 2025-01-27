import React from "react";
import { Outlet } from "react-router";
import MoveToTop from "./Shared/MoveToTop";

function App() {
  return (
    
    <>
      <Outlet />
      <MoveToTop />
    </>
  );
}

export default App;
