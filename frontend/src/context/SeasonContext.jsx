import React, { createContext, useContext, useState } from 'react';

const SeasonContext = createContext();

export function SeasonProvider({ children }) {
    const [season, setSeason] = useState(2026);

    return (
        <SeasonContext.Provider value={{ season, setSeason }}>
            {children}
        </SeasonContext.Provider>
    );
}

export function useSeason() {
    const context = useContext(SeasonContext);
    if (context === undefined) {
        throw new Error('useSeason must be used within a SeasonProvider');
    }
    return context;
}
