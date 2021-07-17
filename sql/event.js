
exports.getEvents = connection => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from events ORDER BY started_at DESC', (err, rows, fields) => {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getEventData = (connection, id) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from events where event_id = ?', id, (err, rows, fields) => {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getEventUsers = (connection, id) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `select
                events.event_id
                ,users.room_id
                ,users.room_name
                ,users.room_url_key
            from
                event_history
            left join
                events
            on
                event_history.event_id = events.event_id
            left join
                users
            on
                event_history.room_id = users.room_id
            where
                event_history.event_id = ?
            GROUP by users.room_id`,
            id,
            (err, rows, fields) => {
                if (err) reject();
                resolve(rows);
            });
    });
}