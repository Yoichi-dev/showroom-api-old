let express = require('express');
let request = require("request");

let router = express.Router();

const apiBaseURL = "https://www.showroom-live.com/api/"
const onliveURL = "https://www.showroom-live.com/api/live/onlives"

router.get('/', (req, res, next) => {
  res.send('parameter: room_id');
});

// ルームIDから配信IDを取得
router.get('/live_info/:id', (req, res, next) => {

  if (req.params.id === '' || req.params.id.length < 5) {
    res.send('Error');
    return
  }

  let options = {
    url: apiBaseURL + "live/live_info?room_id=" + req.params.id,
    method: 'GET',
    json: true
  }

  request(options, (error, response, body) => {
    console.log('==========')
    console.log(body.room_id)
    console.log(body.room_name)
    console.log('==========')
    res.send(body);
  })

});

// テスト用（オンライブ1位のルームIDを取得）
router.get('/onlive', (req, res, next) => {
  console.log('テスト実行')
  let options = {
    url: onliveURL,
    method: 'GET',
    json: true
  }
  request(options, (error, response, body) => {
    res.send(body.onlives[0].lives[0]);
  })
});

module.exports = router;
