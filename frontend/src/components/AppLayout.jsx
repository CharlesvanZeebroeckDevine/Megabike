import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

import { useSeason } from "../context/SeasonContext";

export default function AppLayout() {
  const { season, setSeason } = useSeason();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="bg-slate-900 text-white px-4 py-2 text-sm flex justify-end items-center gap-2">
        <span>Season:</span>
        <select
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
          className="bg-slate-800 border-none text-white rounded px-2 py-0.5"
        >
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
        </select>
      </div>
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


