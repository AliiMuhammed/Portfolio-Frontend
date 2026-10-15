import React from "react";
import { MotionConfig } from "framer-motion";
import { Outlet } from "react-router";
import Navbar from "./Shared/Navbar";
import PageTransition from "./Shared/PageTransition";
import MoveToTop from "./Shared/MoveToTop";
import Toast from "./Shared/Toast";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Navbar />
        <PageTransition>
          <Outlet />
        </PageTransition>
        <Toast />
        <MoveToTop />
      </div>
    </MotionConfig>
  );
}

export default App;
