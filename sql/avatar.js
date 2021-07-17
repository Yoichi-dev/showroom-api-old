exports.getAvatars = (connection) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from avatars', function (err, rows, fields) {
            if (err) reject();
            resolve(rows);
        });
    });
}