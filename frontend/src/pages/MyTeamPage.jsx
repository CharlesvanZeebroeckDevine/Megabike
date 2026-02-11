import React from "react";
import AccessCodeForm from "../components/AccessCodeForm";
import TeamBuilder from "../components/TeamBuilder";
import TeamSummary from "../components/TeamSummary";
import { debugLog } from "../services/debug";
import {
  verifyAccessCode,
  getAuthToken,
  setAuthToken,
  LOCK_DATE
} from "../services/api";
import { useSeason } from "../context/SeasonContext";
import { useTeamData } from "../hooks/useTeamData";

import SeasonSelector from "../components/SeasonSelector";

export default function MyTeamPage() {
  const { season } = useSeason();
  const [token, setToken] = React.useState(getAuthToken());
  const [isEditing, setIsEditing] = React.useState(false);

  const { me, team, loading: dataLoading, error: dataError, setError: setDataError, loadTeam, saveTeam } = useTeamData(season);
  // Separate loading state for form submission (Access Code)
  const [formLoading, setFormLoading] = React.useState(false);

  const authed = !!token;
  const isLocked = new Date() > new Date(LOCK_DATE);

  // Load team data when auth changes
  React.useEffect(() => {
    if (authed) loadTeam();
  }, [authed, season, loadTeam]);

  // Reset editing when team changes or season changes
  React.useEffect(() => {
    setIsEditing(false);
  }, [team?.id, season]);

  const handleAccessCodeSubmit = async (accessCode) => {
    if (!accessCode) return;
    setFormLoading(true);
    setDataError(null);
    try {
      const res = await verifyAccessCode(accessCode);
      setToken(res.token);
      debugLog("Verified access code", res.user);
    } catch (e) {
      setDataError(e?.message || "Code invalide.");
      debugLog("verifyAccessCode error", e?.message ?? e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleTeamSubmit = async (payload) => {
    const success = await saveTeam(payload);
    if (success) {
      setIsEditing(false);
    }
  };

  const loading = dataLoading || formLoading;
  const error = dataError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mon Équipe ({season})</h1>
          <p className="mt-1 text-slate-600">
            {season === 2026
              ? `Verrouillée a partir du 28 Février 14h00`
              : "Visualisation d'équipe archivée."}
          </p>
        </div>
        <SeasonSelector />
      </div>

      {!authed ? (
        <AccessCodeForm
          isLoading={loading}
          error={error}
          onSubmit={handleAccessCodeSubmit}
        />
      ) : loading && !team ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">
          Chargement de votre équipe...
        </div>
      ) : team && !isEditing ? (
        <TeamSummary
          me={me}
          team={team}
          onEdit={
            season === 2026 && !isLocked
              ? () => setIsEditing(true)
              : undefined
          }
        />
      ) : (
        <TeamBuilder
          season={season}
          isSubmitting={loading}
          initialTeam={team}
          onSubmit={handleTeamSubmit}
          apiError={error} // Pass error down to builder if needed, or handle here
        />
      )}

      {authed && !team && error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : null}
    </div>
  );
}
