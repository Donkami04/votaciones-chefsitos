import { Pool } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const MAX_VOTES_PER_EVENT = 4;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text, params) => pool.query(text, params);

export const getEvents = async () => {
    // For now, we manually return the 3 events as specified, 
    // or we could fetch them from a table if we create one.
    // The user mentioned a "events" table.
    try {
        const res = await query(`
            SELECT e.*, COUNT(v.id)::int as vote_count 
            FROM events e 
            LEFT JOIN votes v ON e.id = v.event_id 
            GROUP BY e.id 
            ORDER BY e.id ASC
        `);
        return res.rows;
    } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback or return empty
        return [
            { id: 1, name: "Flor y Jorge" },
            { id: 2, name: "Yas y Alex" },
            { id: 3, name: "May y Cami" }
        ];
    }
};

export const checkVote = async (eventId, deviceIdHash) => {
    const res = await query(
        'SELECT * FROM votes WHERE event_id = $1 AND device_id = $2',
        [eventId, deviceIdHash]
    );
    return res.rows.length > 0;
};

export const submitVote = async (voteData) => {
    const { eventId, deviceId, creativity, flavor, presentation, activity } = voteData;
    
    // Final server-side check before physical insert
    const countRes = await query('SELECT COUNT(*) as count FROM votes WHERE event_id = $1', [eventId]);
    if (parseInt(countRes.rows[0].count) >= MAX_VOTES_PER_EVENT) {
        throw new Error('LIMIT_REACHED');
    }

    await query(
        'INSERT INTO votes (event_id, device_id, creativity, flavor, presentation, activity) VALUES ($1, $2, $3, $4, $5, $6)',
        [eventId, deviceId, creativity, flavor, presentation, activity]
    );
};

export const getResults = async () => {
    try {
        const res = await query(`
            SELECT 
                e.id, 
                e.name,
                COUNT(v.id)::int as vote_count,
                COALESCE(SUM(v.creativity + v.flavor + v.presentation + v.activity), 0)::int as total_score,
                COALESCE(AVG(v.creativity + v.flavor + v.presentation + v.activity), 0)::float as average_score,
                COALESCE(AVG(v.creativity), 0)::float as avg_creativity,
                COALESCE(AVG(v.flavor), 0)::float as avg_flavor,
                COALESCE(AVG(v.presentation), 0)::float as avg_presentation,
                COALESCE(AVG(v.activity), 0)::float as avg_activity
            FROM events e 
            LEFT JOIN votes v ON e.id = v.event_id 
            GROUP BY e.id, e.name
            ORDER BY total_score DESC
        `);
        
        const results = res.rows;
        if (results.length > 0) {
            const maxScore = Math.max(...results.map(r => r.total_score));
            results.forEach(r => {
                r.is_winner = (r.total_score === maxScore && r.total_score > 0);
            });
        }

        return results;
    } catch (error) {
        console.error('Error fetching results:', error);
        return [];
    }
};
