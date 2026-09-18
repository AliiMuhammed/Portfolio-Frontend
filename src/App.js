import React from "react";
import { Outlet } from "react-router";
import Navbar from "./Shared/Navbar";
import PageTransition from "./Shared/PageTransition";
import MoveToTop from "./Shared/MoveToTop";
import Toast from "./Shared/Toast";

function App() {
  return (
    <div className="app">
      <Navbar />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <Toast />
      <MoveToTop />
    </div>
  );
}

export default App;
