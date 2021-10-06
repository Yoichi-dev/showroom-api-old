'use strict';

let express = require('express');
let router = express.Router();
let MY_SQL = require('mysql');
let request = require('then-request');
const { JSDOM } = require("jsdom");
const FETCH = require('node-fetch');

let common = require('../common');
// let sql_user = require('../sql/user');

// let mysql_setting = common.mysqlSetting();

const BASE_URL = "https://www.showroom-live.com/api";
const BASE_SEARCH_URL = "https://www.showroom-live.com";
const BASE_ON_LIVE_URL = "https://www.showroom-live.com/api/live/onlives";

function checkStatus(code) {
  if (code != 200) throw `status code : ${code}`;
}

// ユーザ一覧
router.get('/', common.asyncWrapper(async (req, res, next) => {
  res.json(null);
}));

// ギフト情報
router.get('/giftlist/:user_id', common.asyncWrapper(async (req, res, next) => {

  if (req.params.user_id == null || req.params.user_id == "" || req.params.user_id == "live") {
    res.json({});
  } else {
    let giftlistData = await getApi(`${BASE_URL}/live/gift_list?room_id=${req.params.user_id}`);
    res.json(giftlistData);
  };

}));

// リスナー情報
router.get('/listener/:user_id', common.asyncWrapper(async (req, res, next) => {

  if (req.params.user_id == null || req.params.user_id == "" || req.params.user_id == "live") {
    res.json({});
  } else {
    let listenerData = await getApi(`${BASE_URL}/user/profile?user_id=${req.params.user_id}`);
    res.json(listenerData);
  };

}));

// ライブランキング
router.get('/ranking/:room_id', common.asyncWrapper(async (req, res, next) => {

  if (req.params.room_id == null || req.params.room_id == "" || req.params.room_id == "live") {
    res.json({});
  } else {
    let rankingData = await getApi(`${BASE_URL}/live/stage_user_list?room_id=${req.params.room_id}`);
    res.json(rankingData);
  };

}));

// テロップ情報
router.get('/telop/:room_id', common.asyncWrapper(async (req, res, next) => {

  if (req.params.room_id == null || req.params.room_id == "") {
    res.json({});
  } else {
    let telopData = await getApi(`${BASE_URL}/live/telop?room_id=${req.params.room_id}`);
    res.json(telopData);
  }

}));

// 動画情報
router.get('/streaming/:room_id', common.asyncWrapper(async (req, res, next) => {

  if (req.params.room_id == null || req.params.room_id == "") {
    res.json({});
  } else {
    let streamingData = await getApi(`${BASE_URL}/live/streaming_url?room_id=${req.params.room_id}`);
    if (streamingData == null) {
      res.json({});
    } else {
      res.json(streamingData);
    }
  }

}));

// 検索
router.get('/search', common.asyncWrapper(async (req, res, next) => {

  let searchData = [];

  if (req.query.keyword == null || req.query.keyword == "") {
    res.json(searchData);
  } else {

    try {

      console.log('検索開始');
      console.log(`キーワード：${req.query.keyword}`);
      let enc = encodeURI(req.query.keyword);
      const event_res = await FETCH(`https://www.showroom-live.com/room/search?genre_id=0&keyword=${enc}`);
      checkStatus(event_res.status);
      console.log('検索成功');

      const event_html = await event_res.text();
      const event_dom = new JSDOM(event_html);
      const event_document = event_dom.window.document;
      const event_nodes = event_document.getElementById('room-list').getElementsByClassName('search_res_li');

      for (let i = 0; i < event_nodes.length; i++) {

        if (i < 10) {
          // ルーム画像を取得
          let roomData = await getApi(`${BASE_URL}/room/profile?room_id=${event_nodes[i].getElementsByClassName('listcardinfo-image')[0].getElementsByClassName('room-url')[0].dataset.roomId}`);
          searchData.push(
            {
              img: roomData.image,
              id: event_nodes[i].getElementsByClassName('listcardinfo-image')[0].getElementsByClassName('room-url')[0].dataset.roomId,
              title: event_nodes[i].getElementsByClassName('listcardinfo-main-text')[0].textContent
            }
          )
        }

      }

      res.json(searchData);

    } catch (error) {
      console.log(error);
      res.json(searchData);
    }
  }

}));

// 配信中一覧取得
router.get('/onlive/all', common.asyncWrapper(async (req, res, next) => {

  let onLiveData = await getApi(BASE_ON_LIVE_URL);
  res.json(onLiveData);

}));

// 配信中（人気）一覧取得
router.get('/onlive/popular', common.asyncWrapper(async (req, res, next) => {

  let onLiveData = await getApi(BASE_ON_LIVE_URL);
  res.json(onLiveData.onlives[0].lives);

}));

function getApi(url) {
  return new Promise((resolve, reject) => {
    request('GET', url).done((res) => {
      if (res.statusCode == 404) {
        reject(null);
      } else {
        resolve(JSON.parse(res.getBody('utf8')));
      }
    });
  });
}

module.exports = router;
