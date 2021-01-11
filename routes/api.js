let express = require('express');
let request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let router = express.Router();

const apiBaseURL = "https://www.showroom-live.com/api/"
const onliveURL = "https://www.showroom-live.com/api/live/onlives"

router.get('/', (req, res, next) => {
  res.send('parameter: room_id');
});

// 疎通確認
router.get('/alive/:room', (req, res, next) => {
  console.log('==========')
  console.log(req.params.room)
  console.log('==========')
  res.json({ 'alive': true });
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

// ルームIDからルーム情報を取得
router.get('/profile/:id', (req, res, next) => {

  if (req.params.id === '' || req.params.id.length < 5) {
    res.send('Error');
    return
  }

  let options = {
    url: apiBaseURL + "room/profile?room_id=" + req.params.id,
    method: 'GET',
    json: true
  }

  request(options, (error, response, body) => {
    res.send(body);
  })

});

// ルームIDからイベント詳細情報を取得
router.get('/contribution/:event/:user', (req, res, next) => {

  if (req.params.event === '' || req.params.event.length < 3) {
    res.send('Error');
    return
  }
  if (req.params.user === '' || req.params.user.length < 5) {
    res.send('Error');
    return
  }
  let options = {
    url: `https://www.showroom-live.com/event/contribution/${req.params.event}?room_id=${req.params.user}`,
    method: 'GET',
    json: true
  }

  request(options, (error, response, body) => {
    const DOM = new JSDOM(body)
    let table = DOM.window.document.getElementsByTagName('table')[1]
    let json = []
    try {
      for (let i = 1; i < table.rows.length; i++) {
        if (table.rows[i].cells[1].textContent == '0') {
          console.log('配信無し1')
          json.push({})
          break;
        } else {
          json.push({
            rank: table.rows[i].cells[0].textContent,
            user: table.rows[i].cells[1].textContent,
            point: table.rows[i].cells[2].textContent
          })
        }
      }
    } catch (e) {
      let table2 = DOM.window.document.getElementsByTagName('table')[0]
      try {
        for (let i = 1; i < table2.rows.length; i++) {
          if (table2.rows[i].cells[1].textContent == '0') {
            console.log('配信無し2')
            json.push({})
            break;
          } else {
            json.push({
              rank: table2.rows[i].cells[0].textContent,
              user: table2.rows[i].cells[1].textContent,
              point: table2.rows[i].cells[2].textContent
            })
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
    res.json(json);
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
    let count = 0
    // テストで英語出てきたら鬱陶しいから除外
    while (body.onlives[count].lives[count].main_name.includes('JKT48')) {
      count++
    }
    res.send(body.onlives[count].lives[count]);
  })
});

module.exports = router;
