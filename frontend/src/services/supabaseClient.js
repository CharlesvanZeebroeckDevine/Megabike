import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const TOKEN_STORAGE_KEY = "megabike_token";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY");
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getSupabase() {
    return supabase;
}

export function getAuthToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    if (!token) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        // Reset to anon client
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        // Create client with custom header for RLS
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        });
    }
}

export function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export function getUserIdFromToken() {
    const token = getAuthToken();
    if (!token) return null;
    const jwt = parseJwt(token);
    return jwt?.sub || null;
}

// Sync token on load
const savedToken = getAuthToken();
if (savedToken) setAuthToken(savedToken);
