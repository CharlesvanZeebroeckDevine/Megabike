import React from "react";
import { autocompleteRiders, getTopRiders } from "../services/api";
import { debugLog } from "../services/debug";

export default function RiderPicker({ value, onChange, disabled, season }) {
  const [query, setQuery] = React.useState(value?.rider_name ?? "");
  const [options, setOptions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [topRiders, setTopRiders] = React.useState([]);

  React.useEffect(() => {
    setQuery(value?.rider_name ?? "");
  }, [value?.rider_name]);

  // Load top riders on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const riders = await getTopRiders(season);
        if (mounted) setTopRiders(riders);
      } catch (e) {
        console.error("Failed to load top riders", e);
      }
    })();
    return () => { mounted = false; };
  }, [season]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const q = query.trim();
      if (q.length < 2) {
        // Show top riders if query is empty
        if (mounted) setOptions(topRiders);
        return;
      }
      try {
        const res = await autocompleteRiders(q, season);
        if (!mounted) return;
        setOptions(Array.isArray(res) ? res : []);
      } catch (e) {
        debugLog("RiderPicker autocomplete error", e?.message ?? e);
        if (mounted) setOptions([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [query, season, topRiders]);

  const showOptions = open && (options.length > 0 || (query.length < 2 && topRiders.length > 0));
  const displayOptions = query.length < 2 ? topRiders : options;

  return (
    <div className="relative">
      <input
        disabled={disabled}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
        placeholder="Rechercher un coureur..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Give click events a chance to fire
          setTimeout(() => setOpen(false), 200);
        }}
      />

      {showOptions ? (
        <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {query.length < 2 && (
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              Top coureurs (par prix)
            </div>
          )}
          {displayOptions.map((r, idx) => {
            const price = r.price ?? r.points ?? 0;
            return (
              <button
                type="button"
                key={`${r.id}-${idx}`}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-amber-50 border-b border-slate-50 last:border-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange?.(r);
                  debugLog("Rider selected", r);
                  setOpen(false);
                }}
              >
                {/* Rider Image */}
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                  {r.photo_url ? (
                    <img src={r.photo_url} alt={r.rider_name} className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{r.rider_name}</div>
                  <div className="text-xs text-slate-500 truncate">{r.team_name}</div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-700">{price}</span>
                  <span className="block text-xs text-slate-400">coût</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}


