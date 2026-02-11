import React, { useState, useEffect } from "react";

export default function AdminPage() {
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [genCount, setGenCount] = useState(1);
    const [genPrefix, setGenPrefix] = useState("MB26-");

    const login = async (e) => {
        e?.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin", {
                headers: { password } // Send password in headers
            });
            if (res.ok) {
                const data = await res.json();
                setCodes(data.codes);
                setIsAuthenticated(true);
            } else {
                setError("Mot de passe incorrect");
            }
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    const generateCodes = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    password
                },
                body: JSON.stringify({ count: genCount, prefix: genPrefix })
            });

            if (res.ok) {
                // Refresh list
                const listRes = await fetch("/api/admin", { headers: { password } });
                const listData = await listRes.json();
                setCodes(listData.codes);
            } else {
                const err = await res.json();
                alert("Erreur: " + err.error);
            }
        } catch (err) {
            alert("Erreur de génération");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <form onSubmit={login} className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h1 className="mb-6 text-2xl font-bold text-slate-900">Admin Login</h1>
                    {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="mb-4 w-full rounded-md border border-slate-300 px-4 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                        {loading ? "Connexion..." : "Entrer"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold text-slate-900">Administration</h1>

            {/* Generator */}
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Générer des codes</h2>
                <form onSubmit={generateCodes} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm text-slate-600">Préfixe</label>
                        <input
                            className="rounded-md border border-slate-300 px-3 py-2"
                            value={genPrefix}
                            onChange={(e) => setGenPrefix(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600">Nombre</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            className="rounded-md border border-slate-300 px-3 py-2 w-24"
                            value={genCount}
                            onChange={(e) => setGenCount(parseInt(e.target.value))}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Génération..." : "Générer"}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-900">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Utilisateur</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3 text-right">Créé le</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {codes.map((code) => (
                            <tr key={code.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-mono font-medium">{code.code}</td>
                                <td className="px-4 py-3">
                                    {code.users ? (
                                        <span className="font-medium text-slate-900">{code.users.display_name}</span>
                                    ) : (
                                        <span className="text-slate-400 italic">Non assigné</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {code.is_active ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold text-green-800">Actif</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold text-red-800">Inactif</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-500">
                                    {new Date(code.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
