// netlify/functions/admin-get-rsvps.js
const { Pool } = require('pg');

// 1. Define your secure host credentials
const ALLOWED_EMAIL = "celebratekrishmi@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// 2. Initialize PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, password } = JSON.parse(event.body);

        // 3. Dual Security Check: Validate BOTH Email and Password
        if (
            !email || 
            !password || 
            email.toLowerCase() !== ALLOWED_EMAIL || 
            password !== ADMIN_PASSWORD
        ) {
            return { 
                statusCode: 401, 
                body: JSON.stringify({ error: "Invalid email or password" }) 
            };
        }

        // 4. Connect to the database and fetch the live RSVPs
        const client = await pool.connect();
        
        try {
            // Note: Verify 'rsvps' matches your exact PostgreSQL table name
            const result = await client.query('SELECT * FROM rsvps ORDER BY id DESC');
            
            // 5. Return data to dashboard
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.rows)
            };
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Database Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to fetch data from the database." }) 
        };
    }
};
