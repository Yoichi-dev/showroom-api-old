'use strict';

require('dotenv').config();
const ENV = process.env;

exports.dbConnect = connection => {
    return new Promise((resolve, reject) => {
        connection.connect((err) => err ? reject() : resolve());
    });
}

exports.asyncWrapper = fn => {
    return (req, res, next) => {
        return fn(req, res, next).catch(next);
    }
};

exports.mysqlSetting = () => {
    return {
        host: ENV.DB_HOST,
        user: ENV.DB_USER,
        password: ENV.DB_PASSWORD,
        database: ENV.DB_DATABASE,
        charset: ENV.DB_CHARSET
    };
}