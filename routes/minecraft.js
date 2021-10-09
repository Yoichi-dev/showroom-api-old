'use strict';

let express = require('express');
let router = express.Router();
let pinger = require('minecraft-pinger');
let request = require('then-request');
let common = require('../common');
const Line = require('../notification');
const myLine = new Line();
require('dotenv').config();
const ENV = process.env;

router.get('/', (req, res, next) => {
  pinger.ping('minecraft.showroom-app.com', 4466, (error, result) => {
    error ? res.json({}) : res.json(result);
  })
});

// ユーザ情報取得
router.get('/search/:user_id/:twitter_id', common.asyncWrapper(async (req, res, next) => {

  try {
    let userData = await getApi(`https://api.mojang.com/users/profiles/minecraft/${req.params.user_id}`);
    if (userData != null) {
      myLine.setToken(ENV.LINE_API_KEY);
      myLine.notify(`\nMinecraft Server新規利用申請\nID : ${userData.name}\nTwitter : ${req.params.twitter_id}`);
    }
    res.json(userData);
  } catch {
    res.status(404)
    res.json({ error: 'UserID Not Found' })
  }

}));

function getApi(url) {
  return new Promise((resolve, reject) => {
    request('GET', url).done((res) => {
      if (res.statusCode == 200) {
        resolve(JSON.parse(res.getBody('utf8')));
      } else {
        reject(null);
      }
    })
  });
}

module.exports = router;
