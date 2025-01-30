import React from "react";
import { Outlet } from "react-router";
import Navbar from "./Shared/Navbar";
import PageTransition from "./Shared/PageTransition";
import MoveToTop from "./Shared/MoveToTop";

function App() {
  return (
    <div className="relative">
      <PageTransition>
        <Navbar />
        <Outlet />
      </PageTransition>
      <MoveToTop />
    </div>
  );
}

export default App;
