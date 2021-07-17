
exports.getHistory = (connection, id) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from event_history where event_id = ? ORDER BY room_id, get_at', id, function (err, rows, fields) {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getUserHistory = (connection, event_id, room_id) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from event_history where event_id = ? and room_id = ? ORDER BY get_at', [event_id, room_id], function (err, rows, fields) {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getAggregate = (connection, id) => {
    return new Promise((resolve, reject) => {
        connection.query('select * from event_history where event_id = ? and get_at = (select max(get_at) from event_history where event_id = ?)', [id, id], function (err, rows, fields) {
            if (err) reject();
            resolve(rows);
        });
    });
}