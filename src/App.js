import React from "react";
import { Outlet } from "react-router";
import MoveToTop from "./Shared/MoveToTop";
import Navbar from "./Shared/Navbar";

function App() {
  return (

    <>
      <Navbar />
      <Outlet />
      <MoveToTop />
    </>
  );
}

export default App;
