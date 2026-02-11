import React from "react";
import { getMe, updateMe, setAuthToken } from "../services/api";

export default function ProfileHubPage() {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);

    const [form, setForm] = React.useState({
        displayName: "",
    });

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const me = await getMe();
                if (mounted) {
                    setForm({
                        displayName: me.displayName || "",
                    });
                }
            } catch (err) {
                if (mounted) setError("Failed to load profile.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        // Basic Validation
        if (!form.displayName.trim()) {
            setError("Le nom d'affichage ne peut pas être vide.");
            setSaving(false);
            return;
        }

        try {
            await updateMe({
                displayName: form.displayName,
            });
            setSuccess("Profil mis à jour avec succès.");
        } catch (err) {
            console.error(err);
            setError("Échec de la mise à jour du profil. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-500">Chargement du profil...</div>;
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Paramètres de Profil</h1>
                <p className="text-slate-600">Géré par votre fournisseur d'authentification, mais vous pouvez modifier les détails ici.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Status Messages */}
                    {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                    {success && <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">{success}</div>}

                    {/* Display Name */}
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-slate-700">Nom d'affichage</label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={form.displayName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-slate-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                            placeholder="ex. Eddy Merckx"
                        />
                    </div>


                    {/* Actions */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mt-8">
                <h3 className="text-lg font-medium text-red-900">Se Déconnecter</h3>
                <p className="mt-1 text-sm text-red-700">
                    Déconnectez-vous de votre session sur cet appareil.
                </p>
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            // Clear token and reload/redirect
                            setAuthToken(null);
                            window.location.href = "/";
                        }}
                        className="rounded-md bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>
        </div>
    );
}
