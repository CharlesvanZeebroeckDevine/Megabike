import { setAuthToken } from "./supabaseClient";

export function mockLogin(code) {
    const user = { id: "mock-user-id", displayName: `User ${code}`, profileImageUrl: null };
    const token = "mock-token";
    setAuthToken(token);
    return Promise.resolve({ token, user });
}

export function mockGetMe() {
    return Promise.resolve({
        id: "mock-user-id",
        displayName: "Mock User",
        profileImageUrl: "https://placekitten.com/200/200"
    });
}

export function mockUpdateMe(p) {
    return Promise.resolve({
        id: "mock-user-id",
        displayName: p.displayName,
        profileImageUrl: p.profileImageUrl
    });
}

export function mockLatestRace() {
    return Promise.resolve({
        name: "Mock Grand Prix",
        date: "2025-03-15",
        results: [
            { rider: "Tadej Pogačar", team: "UAE Team Emirates", points: 100, rank: 1 },
            { rider: "Jonas Vingegaard", team: "Visma-Lease a Bike", points: 80, rank: 2 },
            { rider: "Mathieu van der Poel", team: "Alpecin-Deceuninck", points: 60, rank: 3 },
        ]
    });
}

export function mockNextRace() {
    return Promise.resolve({
        name: "Tour of Flanders",
        date: "2025-04-06"
    });
}

export function mockMyTeam(season) {
    // If season is not 2026, maybe return generic history or null?
    // adhering to the interface
    return Promise.resolve({
        id: "mock-team-id",
        teamName: "The Mockingbirds",
        totalPrice: 9500,
        points: 1250,
        season: season,
        riders: Array(12).fill(null).map((_, i) => ({
            id: `mock-rider-${i}`,
            rider_name: `Rider ${i + 1}`,
            team_name: "Mock Team",
            nationality: "BE",
            active: true,
            price: 500,
            points: Math.floor(Math.random() * 100)
        }))
    });
}

export function mockLeaderboard() {
    return Promise.resolve({
        teams: Array(10).fill(null).map((_, i) => ({
            id: `team-${i}`,
            teamName: `Team ${i}`,
            points: 1000 - (i * 50),
            ownerName: `Owner ${i}`
        }))
    });
}

export function mockHistory() {
    return Promise.resolve({ podium: [], mostTitles: [] });
}
