import React from "react";

export default function AccessCodeForm({ onSubmit, isLoading, error }) {
  const [accessCode, setAccessCode] = React.useState("");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Code d'accès</h2>
      <p className="mt-1 text-sm text-slate-600">
        Entrez le code qui vous a été donné pour accéder à votre page d'équipe.
      </p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(accessCode.trim());
        }}
      >
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          placeholder="ex. MB-votre-code-2025"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          autoComplete="off"
        />

        {error ? (
          <div className="text-sm text-red-700">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || accessCode.trim().length < 3}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isLoading ? "Vérification..." : "Continuer"}
        </button>
      </form>
    </div>
  );
}


