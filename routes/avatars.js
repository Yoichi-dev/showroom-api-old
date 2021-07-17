'use strict';

let express = require('express');
let router = express.Router();
let MY_SQL = require('mysql');

let common = require('../common');
let sql_avatar = require('../sql/avatar');

let mysql_setting = common.mysqlSetting();

// アバター一覧
router.get('/', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  let db_avatar = await sql_avatar.getAvatars(connection);

  connection.end();
  res.json(db_avatar);
}));

module.exports = router;
