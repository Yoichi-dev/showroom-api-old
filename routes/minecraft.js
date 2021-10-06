'use strict';

let express = require('express');
let router = express.Router();
let pinger = require('minecraft-pinger');
let request = require('then-request');
let common = require('../common');

router.get('/', (req, res, next) => {
  pinger.ping('minecraft.showroom-app.com', 4466, (error, result) => {
    error ? res.json({}) : res.json(result);
  })
});

// ユーザ情報取得
router.get('/search/:user_id', common.asyncWrapper(async (req, res, next) => {

  try {
    let userData = await getApi(`https://api.mojang.com/users/profiles/minecraft/${req.params.user_id}`);
    res.json(userData);
  } catch {
    res.json({
      name: null,
      id: null
    });
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
