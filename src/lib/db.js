import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text, params) => pool.query(text, params);

export const getEvents = async () => {
    // For now, we manually return the 3 events as specified, 
    // or we could fetch them from a table if we create one.
    // The user mentioned a "events" table.
    try {
        const res = await query('SELECT * FROM events ORDER BY id ASC');
        return res.rows;
    } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback or return empty
        return [
            { id: 1, name: "Evento 1" },
            { id: 2, name: "Evento 2" },
            { id: 3, name: "Evento 3" }
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
