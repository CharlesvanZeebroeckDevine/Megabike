import React, { useMemo } from "react";
import RiderPicker from "./RiderPicker";
import { debugLog } from "../services/debug";

const DEFAULT_SLOTS = 12;
const BUDGET = 11000;

export default function TeamBuilder({ onSubmit, isSubmitting, season, initialTeam, apiError }) {
    const [teamName, setTeamName] = React.useState(initialTeam?.teamName || "");
    const [slots, setSlots] = React.useState(() => {
        if (initialTeam?.riders) {
            const filled = [...initialTeam.riders];
            while (filled.length < DEFAULT_SLOTS) filled.push(null);
            return filled.slice(0, DEFAULT_SLOTS);
        }
        return Array(DEFAULT_SLOTS).fill(null);
    });
    const [validationError, setValidationError] = React.useState(null);

    // Optimized calculation
    const { total, remaining } = useMemo(() => {
        const t = slots.reduce((sum, r) => sum + (r?.price ?? r?.points ?? 0), 0);
        return { total: t, remaining: BUDGET - t };
    }, [slots]);

    function setSlot(index, rider) {
        const next = [...slots];
        next[index] = rider;
        setSlots(next);
        // Clear error on change
        if (validationError) setValidationError(null);
    }

    function validate() {
        if (teamName.trim().length < 2) return "Team name is required.";
        // Relaxed validation: check if at least one rider is picked
        const pickedRiders = slots.filter(Boolean);
        if (pickedRiders.length === 0) return "Please pick at least one rider.";

        const names = pickedRiders.map((s) => s?.rider_name);
        const unique = new Set(names);
        if (unique.size !== names.length) return "Each rider must be unique.";
        if (total > BUDGET) return `Budget exceeded by ${Math.abs(remaining)}.`;
        return null;
    }

    const isUpdate = !!initialTeam;
    // Show either local validation error or API error passed down
    const error = validationError || apiError;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">{isUpdate ? "Update your team" : "Create your team"}</h2>
                    <p className="text-sm text-slate-600">
                        Budget: {BUDGET}. {isUpdate ? "You can update until the deadline." : "Create your team once."}
                    </p>
                </div>
                <div className="text-sm">
                    <span className="text-slate-500">Remaining: </span>
                    <span className={remaining < 0 ? "font-semibold text-red-700" : "font-semibold text-slate-900"}>
                        {remaining}
                    </span>
                </div>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700">
                    Team name
                </label>
                <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Team Gilbert"
                />
            </div>

            <div className="mt-5 space-y-3">
                {slots.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
                        <div className="text-xs font-medium text-slate-500 sm:col-span-1">
                            #{idx + 1}
                        </div>
                        <div className="sm:col-span-8 flex items-center gap-2">
                            <div className="flex-1">
                                <RiderPicker
                                    season={season}
                                    value={r}
                                    disabled={isSubmitting}
                                    onChange={(picked) => setSlot(idx, picked)}
                                />
                            </div>
                        </div>
                        <div className="text-sm text-slate-600 sm:col-span-3 sm:text-right flex items-center justify-end gap-3">
                            <span>Cost: {r ? (r.price ?? r.points ?? 0) : "—"}</span>
                            {r && !isSubmitting && (
                                <button
                                    type="button"
                                    onClick={() => setSlot(idx, null)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                                    title="Remove rider"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {error ? <div className="mt-4 text-sm text-red-700 font-medium">{error}</div> : null}

            <div className="mt-5 flex gap-3">
                <button
                    type="button"
                    disabled={isSubmitting}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-slate-800 transition-colors"
                    onClick={() => {
                        const msg = validate();
                        setValidationError(msg);
                        if (msg) return;

                        const payload = {
                            teamName: teamName.trim(),
                            riders: slots.filter(Boolean).map((r) => ({
                                id: r.id,
                                rider_name: r.rider_name,
                            })),
                        };
                        debugLog("Submitting team", payload);
                        onSubmit?.(payload);
                    }}
                >
                    {isSubmitting ? "Saving…" : (isUpdate ? "Update Team" : "Create Team")}
                </button>
            </div>
        </div>
    );
}
