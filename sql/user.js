
exports.getAllUsers = connection => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from users', function (err, rows, fields) {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getUsers = (connection, room_id) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from users where room_id = ?', room_id, function (err, rows, fields) {
            if (err) reject();
            resolve(rows);
        });
    });
}

exports.getAvatars = (connection) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from avatars', function (err, rows, fields) {
            if (err) reject();
            resolve(rows);
        });
    });
}
