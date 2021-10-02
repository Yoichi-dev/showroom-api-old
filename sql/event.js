
exports.getEvents = connection => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from events ORDER BY started_at DESC', (err, rows, fields) => {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getHoldEvents = (connection, time) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from events where started_at < ? AND ended_at > ? ORDER BY started_at DESC', [time, time], (err, rows, fields) => {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getEndEvents = (connection, time) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from events where ended_at <= ? ORDER BY started_at DESC', time, (err, rows, fields) => {
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
        connection.query('select a.event_id as event_id, a.room_id as room_id, a.get_at as get_at, a.follower_num as follower_num, a.gap as gap, a.next_rank as next_rank, a.point as point, a.`rank` as juni from (select event_id, room_id, get_at, follower_num, gap, next_rank, point, `rank` from event_history where event_id = ? and get_at = (select max(get_at) from event_history where event_id = ?)) a left join users b on a.room_id = b.room_id order by a.`rank`',
            [id, id],
            (err, rows, fields) => {
                if (err) reject();
                resolve(rows);
            });
    });
}