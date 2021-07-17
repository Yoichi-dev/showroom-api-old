'use strict';

let express = require('express');
let router = express.Router();
let MY_SQL = require('mysql');

let common = require('../common');
let sql_event = require('../sql/event');

let mysql_setting = common.mysqlSetting();

// イベント一覧
router.get('/', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  let db_events = await sql_event.getEvents(connection);

  connection.end();
  res.json(db_events);
}));

// イベント情報
router.get('/:event_id', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  let db_history = await sql_event.getEventData(connection, req.params.event_id);

  connection.end();
  res.json(db_history);
}));

// イベント参加ユーザ
router.get('/:event_id/users', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  // イベントのユーザ一覧を取得
  let db_event_user = await sql_event.getEventUsers(connection, req.params.event_id);

  connection.end();
  res.json(db_event_user);
}));

module.exports = router;
