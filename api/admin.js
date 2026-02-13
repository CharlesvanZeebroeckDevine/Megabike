const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Auth check
    const { password } = req.headers;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Init Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server config error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        if (req.method === 'GET') {
            // List all codes and users
            // Join users on access_code_id
            const { data: codes, error } = await supabase
                .from('access_codes')
                .select('*, users(id, display_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json({ codes });
        }

        if (req.method === 'POST') {
            const { count = 1, prefix = "MB26-" } = req.body;
            const newCodes = [];

            for (let i = 0; i < count; i++) {
                // Generate random code
                const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
                const code = `${prefix}${randomPart}`;

                // 1. Create Code
                const { data: codeData, error: codeErr } = await supabase
                    .from('access_codes')
                    .insert({ code, is_active: true })
                    .select()
                    .single();

                if (codeErr) throw codeErr;

                // 2. Create Placeholder User
                const { data: userData, error: userErr } = await supabase
                    .from('users')
                    .insert({
                        access_code_id: codeData.id,
                        display_name: `Rookie-${randomPart}`,
                    })
                    .select()
                    .single();

                if (userErr) throw userErr;

                // 3. Link User back to Code
                await supabase
                    .from('access_codes')
                    .update({ assigned_user_id: userData.id })
                    .eq('id', codeData.id);

                newCodes.push({ code, user: userData.display_name });
            }

            return res.status(200).json({ created: newCodes });
        }

        if (req.method === 'PUT') {
            const { userId, displayName } = req.body;

            if (!userId || !displayName) {
                return res.status(400).json({ error: 'Missing userId or displayName' });
            }

            // Update user
            const { data, error } = await supabase
                .from('users')
                .update({ display_name: displayName })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json({ user: data });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error("Admin API Error:", err);
        return res.status(500).json({ error: err.message });
    }
};
