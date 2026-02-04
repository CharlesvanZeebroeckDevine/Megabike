import { useState, useCallback } from "react";
import { getMe, getMyTeam, createMyTeam, updateMyTeam } from "../services/api";
import { debugLog } from "../services/debug";

export function useTeamData(season) {
    const [data, setData] = useState({ me: null, team: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadTeam = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [meRes, teamRes] = await Promise.allSettled([getMe(), getMyTeam(season)]);
            const nextMe = meRes.status === "fulfilled" ? meRes.value : null;
            const nextTeam = teamRes.status === "fulfilled" ? teamRes.value : null;

            setData({ me: nextMe, team: nextTeam });
            debugLog("useTeamData loaded", { nextMe, nextTeam });
        } catch (e) {
            setError(e?.message ?? "Failed to load your team");
            debugLog("useTeamData load error", e?.message ?? e);
        } finally {
            setLoading(false);
        }
    }, [season]);

    const saveTeam = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            if (data.team?.id) {
                await updateMyTeam(data.team.id, payload, season);
            } else {
                await createMyTeam(payload, season);
            }
            // Refresh after save
            await loadTeam();
            return true; // Success
        } catch (e) {
            console.error("Save team error:", e);
            setError(e?.message ?? "Failed to save team");
            return false; // Failure
        } finally {
            setLoading(false);
        }
    }, [season, data.team, loadTeam]);

    return {
        me: data.me,
        team: data.team,
        loading,
        error,
        setError,
        loadTeam,
        saveTeam
    };
}
