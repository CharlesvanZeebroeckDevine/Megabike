import React from "react";
import { useSeason } from "../context/SeasonContext";

export default function SeasonSelector({ className = "" }) {
    const { season, setSeason } = useSeason();

    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            <span className="text-slate-600">Saison :</span>
            <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="bg-white border border-slate-300 text-slate-900 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
            </select>
        </div>
    );
}
