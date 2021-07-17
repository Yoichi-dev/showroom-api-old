'use strict';

let express = require('express');
let router = express.Router();
let MY_SQL = require('mysql');

let common = require('../common');
let sql_history = require('../sql/history');

let mysql_setting = common.mysqlSetting();

router.get('/', (req, res, next) => {
  res.json({ title: 'イベント履歴' });
});

// 履歴
router.get('/:event_id', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  let db_history = await sql_history.getHistory(connection, req.params.event_id);

  connection.end();
  res.json(db_history);
}));

// 集計用
router.get('/aggregate/:event_id', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  let db_history = await sql_history.getAggregate(connection, req.params.event_id);

  connection.end();
  res.json(db_history);
}));

// 履歴（個別）
router.get('/:event_id/:room_id', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  let db_history = await sql_history.getUserHistory(connection, req.params.event_id, req.params.room_id);

  connection.end();
  res.json(db_history);
}));

module.exports = router;
