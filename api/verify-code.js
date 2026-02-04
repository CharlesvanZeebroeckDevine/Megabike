const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
    // CORS support
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { accessCode } = req.body;

    if (!accessCode) {
        return res.status(400).json({ error: 'Missing access code' });
    }

    // Init Supabase Service Role (Server-side only)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
        console.error("Missing Env Vars");
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 1. Check Access Code in DB
        const { data: codeData, error: codeError } = await supabase
            .from('access_codes')
            .select('*')
            .eq('code', accessCode)
            .eq('is_active', true)
            .single();

        if (codeError || !codeData) {
            return res.status(401).json({ error: 'Invalid or inactive access code' });
        }

        let userId = codeData.assigned_user_id;
        let newUser = false;

        // 2. Data Consistency Check: If no user is assigned to the Access Code,
        // it's possible a User record already exists for this code but the link in access_codes is broken/missing.
        // We must check the 'users' table by access_code_id to avoid "duplicate key" violation.
        if (!userId) {
            const { data: existingUser, error: lookupErr } = await supabase
                .from('users')
                .select('id')
                .eq('access_code_id', codeData.id)
                .maybeSingle();

            if (lookupErr) {
                console.error("DB Error (lookup existing user):", lookupErr);
                return res.status(500).json({ error: 'Database check failed' });
            }

            if (existingUser) {
                // Recover: User exists but wasn't linked in access_codes
                userId = existingUser.id;
                // Repair the link
                await supabase
                    .from('access_codes')
                    .update({ assigned_user_id: userId })
                    .eq('id', codeData.id);
            }
        }

        // 3. If STILL no user, we can safely create one.
        if (!userId) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert({
                    access_code_id: codeData.id,
                    display_name: `Rookie`, // Default name
                })
                .select()
                .single();

            if (userError) {
                console.error("User creation error", userError);
                return res.status(500).json({ error: 'Failed to create user' });
            }

            userId = userData.id;
            newUser = true;

            // Update access code with assigned user
            await supabase
                .from('access_codes')
                .update({ assigned_user_id: userId })
                .eq('id', codeData.id);
        }

        // 3. Fetch User Details (if existing)
        const { data: userDetails } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        // 4. Generate JWT
        const payload = {
            sub: userId,
            role: 'authenticated', // Important for Supabase RLS
            aud: 'authenticated',
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
            app_metadata: {
                provider: 'access_code'
            },
            user_metadata: {
                displayName: userDetails?.display_name
            }
        };

        const token = jwt.sign(payload, jwtSecret);

        return res.status(200).json({
            token,
            user: {
                id: userId,
                displayName: userDetails?.display_name,
                profileImageUrl: userDetails?.profile_image_url
            },
            isNewUser: newUser
        });

    } catch (err) {
        console.error("Handler error", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
