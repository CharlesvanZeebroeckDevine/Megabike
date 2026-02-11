import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout() {

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">

      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


