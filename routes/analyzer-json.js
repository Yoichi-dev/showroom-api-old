'use strict'
let express = require('express')
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const fs = require('fs')
let request = require('sync-request');
let router = express.Router()
let cron = require('node-cron')

const EVENT_URL = "https://www.showroom-live.com/event/"
const PROFILE_URL = "https://www.showroom-live.com/api/room/profile?room_id="
const EVENT_SUPPORT_URL = "https://www.showroom-live.com/api/room/event_and_support?room_id="

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('イベント分析用API')
})

/* イベントURLからイベントID参加者ユーザを取得 */
router.get('/event-url/:url', (req, res, next) => {

  // 取得時間
  const ANALYZE_TIME = Math.floor(new Date().getTime() / 1000)
  // イベントリスト
  let eventList = null

  // バリデーションチェック
  if (req.params.url === '' || req.params.url.length < 2) {
    throw new Error('Validation Error')
  }

  // イベント管理ファイルがあるか
  try {
    eventList = JSON.parse(fs.readFileSync("./json/event.json", 'utf-8'))
  } catch (error) {
    throw new Error('Not Event File')
  }

  // イベントURLから参加者ユーザを取得
  let userListHTML = getData(EVENT_URL, req.params.url)
  if (userListHTML.statusCode != 200) {
    throw new Error('Not Event Page : ' + req.params.url)
  }

  // DOM操作可能に
  const dom = new JSDOM(userListHTML.getBody('utf8'))
  // 参加者を選択
  let domData = dom.window.document.getElementsByClassName('js-follow-btn')

  // 参加者が登録されていない場合
  if (domData.length == 0) {
    throw new Error('Not Event Member')
  }

  let eventFileName = ""
  let writeJson = {}
  writeJson.data = []

  // メンバー取得
  for (let i = 0; i < domData.length; i++) {

    // ユーザのルームID
    let userRoomId = domData[i].dataset.roomId

    // ユーザプロフィールを取得
    let userProfile = getData(PROFILE_URL, userRoomId)
    if (userProfile.statusCode != 200) {
      throw new Error('Not User Profile : ' + userRoomId)
    }
    let userProfileJson = JSON.parse(userProfile.getBody('utf8'))

    // ユーザイベント情報を取得
    let userEvent = getData(EVENT_SUPPORT_URL, userRoomId)
    if (userEvent.statusCode != 200) {
      throw new Error('Not User Event : ' + userRoomId)
    }
    let userEventJson = JSON.parse(userEvent.getBody('utf8'))

    if (userEventJson.event === null) {
      throw new Error('Not Start Event')
    }

    // イベント情報を取得
    if (i == 0) {
      if (eventList.event.some((val) => val === userEventJson.event.event_id)) {
        // TODO:集計ページへ遷移させる
        throw new Error('Add Event')
      }
      eventFileName = userEventJson.event.event_id
      writeJson.event_id = userEventJson.event.event_id
      writeJson.event_name = userEventJson.event.event_name
      writeJson.started_at = userEventJson.event.started_at
      writeJson.ended_at = userEventJson.event.ended_at
      writeJson.image = userEventJson.event.image
      writeJson.event_url = userEventJson.event.event_url
      writeJson.analyze_time = ANALYZE_TIME
    }

    let subJson = {
      "room_id": userRoomId,
      "room_name": userProfileJson.room_name,
      "room_url_key": userProfileJson.room_url_key,
      "point": [
        {
          "follower_num": userProfileJson.follower_num,
          "rank": userEventJson.event.ranking.rank,
          "next_rank": userEventJson.event.ranking.next_rank,
          "point": userEventJson.event.ranking.point,
          "gap": userEventJson.event.ranking.gap,
          "create_at": ANALYZE_TIME
        }
      ]
    }

    writeJson.data.push(subJson)

  }

  fs.writeFileSync(`./json/${eventFileName}.json`, JSON.stringify(writeJson))

  eventList.event.push(eventFileName)
  fs.writeFileSync("./json/event.json", JSON.stringify(eventList))

  res.json({ "add": 200 })
  return

})

/* イベントリスト取得 */
router.get('/event-list', (req, res, next) => {
  let eventList = null

  let returnJson = {}
  returnJson.data = []

  // イベント管理ファイルがあるか
  try {
    eventList = JSON.parse(fs.readFileSync("./json/event.json", 'utf-8'))
  } catch (error) {
    throw new Error('Not Event File')
  }

  // イベントID分ループ
  eventList.event.forEach((val) => {
    let baseJson = null
    try {
      baseJson = JSON.parse(fs.readFileSync(`./json/${val}.json`, 'utf-8'))
    } catch (error) {
      console.log('イベントファイル無し' + val)
      return
    }
    returnJson.data.push({
      "event_id": baseJson.event_id,
      "event_name": baseJson.event_name,
      "started_at": baseJson.started_at,
      "ended_at": baseJson.ended_at,
      "image": baseJson.image,
      "event_url": baseJson.event_url,
      "member": baseJson.data.length,
      "analyze_time": baseJson.analyze_time
    })
  })
  res.json(returnJson);
})

/* イベントデータ取得 */
router.get('/event-data/:id', (req, res, next) => {
  let readJson = null

  try {
    readJson = JSON.parse(fs.readFileSync(`./json/${req.params.id}.json`, 'utf-8'))
  } catch (error) {
    throw new Error('No Add Event')
  }

  res.json(readJson);
})

/* イベントリスト削除 */
router.get('/event-delete/:id', (req, res, next) => {
  let eventList = null

  const DELETE_TIME = Math.floor(new Date().getTime() / 1000)

  // バリデーションチェック
  if (req.params.id === '' || req.params.id.length < 5) {
    throw new Error('Validation Error')
  }

  // イベント管理ファイルがあるか
  try {
    eventList = JSON.parse(fs.readFileSync("./json/event.json", 'utf-8'))
  } catch (error) {
    throw new Error('Not Event File')
  }

  if (!eventList.event.some((val) => val === req.params.id)) {
    throw new Error('Not Event File')
  }

  let newArray = {}
  newArray.event = eventList.event.filter(n => n != req.params.id)
  fs.writeFileSync(`./json/event.json`, JSON.stringify(newArray))

  // // イベント管理ファイルがあるか
  try {
    fs.rename(`./json/${req.params.id}.json`, `./json/${req.params.id}_${DELETE_TIME}.json`, (err) => {
      if (err) throw err;
      console.log('ファイルを削除しました')
    })
  } catch (error) {
    throw new Error('Delete Event Error : ' + req.params.id)
  }

  res.json({ "status": 200 })
})

/* 登録イベントリスト取得 */
router.get('/event-json', (req, res, next) => {
  let eventList = null

  // イベント管理ファイルがあるか
  try {
    eventList = JSON.parse(fs.readFileSync("./json/event.json", 'utf-8'))
  } catch (error) {
    throw new Error('Not Event File')
  }

  res.json(eventList)
})

/* イベント一括アップデート */
function update() {
  const ANALYZE_TIME = Math.floor(new Date().getTime() / 1000)
  let eventList = null

  // イベント管理ファイルがあるか
  try {
    eventList = JSON.parse(fs.readFileSync("./json/event.json", 'utf-8'))
  } catch (error) {
    throw new Error('Not Event File')
  }

  // イベントID分ループ
  eventList.event.forEach((updateEventId) => {

    let baseJson = null
    try {
      baseJson = JSON.parse(fs.readFileSync(`./json/${updateEventId}.json`, 'utf-8'))
    } catch (error) {
      return
    }

    // イベントが終了しているか確認
    if (ANALYZE_TIME > baseJson.ended_at) {
      console.log("イベント終了")
      return
    }

    // イベントURLから参加者ユーザを取得
    let userListHTML = getData(baseJson.event_url, "")
    if (userListHTML.statusCode != 200) {
      return
    }

    // DOM操作可能に
    const dom = new JSDOM(userListHTML.getBody('utf8'))
    // 参加者を選択
    let domData = dom.window.document.getElementsByClassName('js-follow-btn')

    // 参加者が登録されていない場合
    if (domData.length == 0) {
      console.log("参加者無し")
      return
    }

    for (let i = 0; i < domData.length; i++) {

      // ユーザのルームID
      let userRoomId = domData[i].dataset.roomId

      // 既に登録済みか確認
      let flg = baseJson.data.some((val) => val.room_id === userRoomId)

      // ユーザプロフィールを取得
      let userProfile = getData(PROFILE_URL, userRoomId)
      if (userListHTML.statusCode != 200) {
        console.log('ユーザプロフィール取得失敗' + userRoomId)
        return
      }
      let userProfileJson = JSON.parse(userProfile.getBody('utf8'))

      // ユーザイベント情報を取得
      let userEvent = getData(EVENT_SUPPORT_URL, userRoomId)
      if (userEvent.statusCode != 200) {
        console.log('ユーザ参加イベント取得失敗' + userRoomId)
        return
      }
      let userEventJson = JSON.parse(userEvent.getBody('utf8'))

      if (flg) {
        baseJson.data.forEach(data => {
          if (data.room_id === userRoomId) {
            data.point.push({
              "follower_num": userProfileJson.follower_num,
              "rank": userEventJson.event.ranking.rank,
              "next_rank": userEventJson.event.ranking.next_rank,
              "point": userEventJson.event.ranking.point,
              "gap": userEventJson.event.ranking.gap,
              "create_at": ANALYZE_TIME
            })
          }
        })
      } else {
        let subJson = {
          "room_id": userRoomId,
          "room_name": userProfileJson.room_name,
          "room_url_key": userProfileJson.room_url_key,
          "point": [
            {
              "follower_num": userProfileJson.follower_num,
              "rank": userEventJson.event.ranking.rank,
              "next_rank": userEventJson.event.ranking.next_rank,
              "point": userEventJson.event.ranking.point,
              "gap": userEventJson.event.ranking.gap,
              "create_at": ANALYZE_TIME
            }
          ]
        }
        baseJson.data.push(subJson)
      }
    }
    fs.writeFileSync(`./json/${updateEventId}.json`, JSON.stringify(baseJson))
  })
}

/* スクレイピング用 */
function getData(baseUrl, parameter) {
  return request(
    'GET',
    baseUrl + parameter
  )
}

/* 自動更新 */
cron.schedule('0 0 0,0,1,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  console.log('イベント情報更新開始')
  update()
  console.log('イベント情報更新終了')
});

module.exports = router
