import { Pool } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
    await query(
        'INSERT INTO votes (event_id, device_id, creativity, flavor, presentation, activity) VALUES ($1, $2, $3, $4, $5, $6)',
        [eventId, deviceId, creativity, flavor, presentation, activity]
    );
};
