'use strict';

let express = require('express');
let router = express.Router();
let MY_SQL = require('mysql');
let request = require('then-request');

let common = require('../common');
let sql_user = require('../sql/user');

let mysql_setting = common.mysqlSetting();

const BASE_URL = "https://www.showroom-live.com/api";
const BASE_ON_LIVE_URL = "https://www.showroom-live.com/api/live/onlives";

// ユーザ一覧
router.get('/', common.asyncWrapper(async (req, res, next) => {
  let connection = MY_SQL.createConnection(mysql_setting);
  await common.dbConnect(connection);

  let db_users = await sql_user.getAllUsers(connection);

  connection.end();
  res.json(db_users);
}));

// テスト用ONLIVE1位の配信情報を取得
router.get('/onlive', common.asyncWrapper(async (req, res, next) => {

  let onLiveData = await getApi(BASE_ON_LIVE_URL);
  res.json(onLiveData.onlives[0].lives[0]);

}));

// プレミアム配信時の配信情報を取得
router.get('/onlive/:room_id', common.asyncWrapper(async (req, res, next) => {

  let onLiveData = await getApi(BASE_ON_LIVE_URL);

  let roomData = {};
  for (let i in onLiveData.onlives) {
    let filter = onLiveData.onlives[i].lives.filter(v => v.room_id == req.params.room_id);
    if (filter.length != 0) {
      roomData = filter;
      break;
    }
  }
  res.json(roomData);

}));

// ユーザ情報
router.get('/:room_id', common.asyncWrapper(async (req, res, next) => {

  if (req.params.room_id == null) res.json({});

  let roomData = await getApi(`${BASE_URL}/room/profile?room_id=${req.params.room_id}`);
  res.json(roomData);

}));

// ユーザの配信情報
router.get('/live/:room_id', common.asyncWrapper(async (req, res, next) => {

  if (req.params.room_id == null) res.json({});

  let liveData = await getApi(`${BASE_URL}/live/live_info?room_id=${req.params.room_id}`);
  res.json(liveData);

}));

function getApi(url) {
  return new Promise((resolve, reject) => {
    request('GET', url).done((res) => {
      resolve(JSON.parse(res.getBody('utf8')));
    });
  });
}

module.exports = router;
