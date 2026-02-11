import React from "react";

const CALENDAR_DATA = [
    { date: "28 février", race: "Het Nieuwsblad", category: "W-Tour" },
    { date: "28 février", race: "Faun-Ardeche-Classic", category: "1.Pro" },
    { date: "01 Mars", race: "Kuurne-Bruxelles-Kuurne", category: "1.Pro" },
    { date: "01 Mars", race: "Faun-Drome Classic", category: "1.Pro" },
    { date: "4 mars", race: "Trofeo Laigueglia", category: "1. Pro" },
    { date: "7 mars", race: "Strade Bianche", category: "W-Tour" },
    { date: "18 mars", race: "Danilith- Nokere Koerse", category: "1.Pro" },
    { date: "18 mars", race: "Milano-Torino", category: "1.Pro" },
    { date: "19 mars", race: "GP de Denain Porte du Hainaut", category: "1.Pro" },
    { date: "20 mars", race: "Bredene Koksijde Classic", category: "1.Pro" },
    { date: "21 mars", race: "Milan-San Remo", category: "Monument" },
    { date: "25 mars", race: "Tour of Bruges", category: "W-Tour" },
    { date: "27 mars", race: "GP de l'E3 Saxo Classic", category: "W-Tour" },
    { date: "29 mars", race: "Gand-Wevelgem (In Flanders Field)", category: "W-Tour" },
    { date: "01 avril", race: "Dwars door Vlaanderen", category: "W-Tour" },
    { date: "4 avril", race: "GP Miguel Indurain", category: "1. Pro" },
    { date: "5 avril", race: "Tour des Flandres", category: "Monument" },
    { date: "8 avril", race: "GP de l'Escaut", category: "1. Pro" },
    { date: "12 avril", race: "Paris-Roubaix", category: "Monument" },
    { date: "17 avril", race: "Fleche brabançonne", category: "1. Pro" },
    { date: "19 avril", race: "Amstel Gold Race", category: "WT" },
    { date: "22 avril", race: "Fleche Wallonne", category: "W-Tour" },
    { date: "26 avril", race: "Liege-Bastogne-Liege", category: "Monument" },
];

export default function CalendarPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold text-slate-900">Calendrier des courses 2026</h1>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Course</th>
                            <th className="px-4 py-3 font-semibold text-right">Catégorie</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {CALENDAR_DATA.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="whitespace-nowrap px-4 py-3">{row.date}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{row.race}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${row.category === "Monument"
                                            ? "bg-amber-100 text-amber-800"
                                            : row.category === "W-Tour" || row.category === "WT"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {row.category}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold text-amber-900">Changements de calendrier</h2>
                <div className="space-y-2 text-sm text-amber-800">
                    <p>
                        En 2020 et 2021, nous avons connu un calendrier chamboulé suite à la pandémie de COVID-19. Mais il n'y a pas eu de problèmes en 2022-2025.
                        Même si la situation apparaît meilleure, un tel cas de figure n'est pas impossible (quoique peu probable) en 2026.
                    </p>
                    <p>
                        Je propose d’appliquer les principes que nous avons suivis en 2020 et 2021, c’est-à-dire :
                    </p>
                    <ul className="list-disc pl-5">
                        <li>
                            On garde toutes les courses au calendrier 2026, même si elles sont postposées, pour autant qu’elles aient lieu en 2026.
                        </li>
                        <li>
                            Pas de changement dans la composition des équipes une fois que la première course est lancée.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
