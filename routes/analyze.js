let express = require('express')
var request = require('sync-request')
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const fs = require('fs')

let router = express.Router()

const EVENT_URL = "https://www.showroom-live.com/event/"
const PROFILE_URL = "https://www.showroom-live.com/api/room/profile?room_id="
const EVENT_SUPPORT_URL = "https://www.showroom-live.com/api/room/event_and_support?room_id="

router.get('/', (req, res, next) => {
    res.send('parameter: event_id')
})

// イベントURLからイベントID参加者ユーザを取得
router.get('/event/:url', (req, res, next) => {

    let readJson = null

    // イベント管理ファイルがあるか
    try {
        let readText = fs.readFileSync("./event.json", 'utf-8')
        readJson = JSON.parse(readText)
    } catch (error) {
        res.send({ "Error": 500 })
        return
    }

    let eventFileName = ""
    let writeJson = {}
    writeJson.data = []

    const ANALYZE_TIME = (Math.floor(new Date().getTime() / 1000)) + 32400

    if (req.params.url === '' || req.params.url.length < 2) {
        res.send({ "Error": 404 })
        return
    }

    // イベントURLから参加者ユーザを取得
    let userListHTML = getData(EVENT_URL, req.params.url)
    if (userListHTML.statusCode != 200) {
        res.send({ "Error": 500 })
        return
    }

    const dom = new JSDOM(userListHTML.getBody('utf8'))
    let domData = dom.window.document.getElementsByClassName('js-follow-btn')

    for (let i = 0; i < domData.length; i++) {

        // ユーザのルームID
        let userRoomId = domData[i].dataset.roomId

        // ユーザプロフィールを取得
        let userProfile = getData(PROFILE_URL, userRoomId)
        if (userListHTML.statusCode != 200) {
            res.send({ "Error": 500 })
            return
        }
        let userProfileJson = JSON.parse(userProfile.getBody('utf8'))

        // ユーザイベント情報を取得
        let userEvent = getData(EVENT_SUPPORT_URL, userRoomId)
        if (userEvent.statusCode != 200) {
            res.send({ "Error": 500 })
            return
        }
        let userEventJson = JSON.parse(userEvent.getBody('utf8'))

        // イベント情報を取得
        if (i === 1) {
            if (readJson.event.some((element) => element === userEventJson.event.event_id)) {
                res.send({ "Error": 500, "Message": "既に登録済みです" })
                return
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

    fs.writeFileSync(`./event/${eventFileName}.json`, JSON.stringify(writeJson))

    readJson.event.push(eventFileName)
    fs.writeFileSync("./event.json", JSON.stringify(readJson))

    res.send({ "OK": 200 })
    return

})

// イベント一括アップデート
router.get('/update', (req, res, next) => {
    const ANALYZE_TIME = (Math.floor(new Date().getTime() / 1000)) + 32400
    let readJson = null

    // イベント管理ファイルがあるか
    try {
        let readText = fs.readFileSync("./event.json", 'utf-8')
        readJson = JSON.parse(readText)
    } catch (error) {
        res.send({ "Error": 600 })
        return
    }

    // イベントID分ループ
    readJson.event.forEach((updateEventId) => {

        let baseJson = null

        try {
            let readText = fs.readFileSync(`./event/${updateEventId}.json`, 'utf-8')
            baseJson = JSON.parse(readText)
        } catch (error) {
            res.send({ "Error": 600 })
            return
        }

        // イベントURLから参加者ユーザを取得
        let userListHTML = getData(baseJson.event_url, "")
        if (userListHTML.statusCode != 200) {
            res.send({ "Error": 500 })
            return
        }

        const dom = new JSDOM(userListHTML.getBody('utf8'))
        let domData = dom.window.document.getElementsByClassName('js-follow-btn')

        for (let i = 0; i < domData.length; i++) {

            // ユーザのルームID
            let userRoomId = domData[i].dataset.roomId

            // 既に登録済みか確認
            let flg = baseJson.data.some((element) => element.room_id === userRoomId)

            // ユーザプロフィールを取得
            let userProfile = getData(PROFILE_URL, userRoomId)
            if (userListHTML.statusCode != 200) {
                res.send({ "Error": 500 })
                return
            }
            let userProfileJson = JSON.parse(userProfile.getBody('utf8'))

            // ユーザイベント情報を取得
            let userEvent = getData(EVENT_SUPPORT_URL, userRoomId)
            if (userEvent.statusCode != 200) {
                res.send({ "Error": 500 })
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
                        console.log('更新追加')
                    }
                })
            } else {
                let subJson = {
                    "room_id": userRoomId,
                    "room_name": userEventJson.room_name,
                    "room_url_key": userEventJson.room_url_key,
                    "point": [
                        {
                            "follower_num": userEventJson.follower_num,
                            "rank": userEventJson.event.ranking.rank,
                            "next_rank": userEventJson.event.ranking.next_rank,
                            "point": userEventJson.event.ranking.point,
                            "gap": userEventJson.event.ranking.gap,
                            "create_at": ANALYZE_TIME
                        }
                    ]
                }
                baseJson.data.push(subJson)
                console.log('新規追加')
            }
        }
        fs.writeFileSync(`./event/${updateEventId}.json`, JSON.stringify(baseJson))
    })
    res.send({ "OK": 200 })
    return
})

function getData(baseUrl, parameter) {
    return request(
        'GET',
        baseUrl + parameter
    )
}

// JSON取得
router.get('/eventlist', (req, res, next) => {
    let readJson = null
    let returnJson = {}
    returnJson.data = []

    // イベント管理ファイルがあるか
    try {
        let readText = fs.readFileSync("./event.json", 'utf-8')
        readJson = JSON.parse(readText)
    } catch (error) {
        res.send({ "Error": 600 })
        return
    }

    // イベントID分ループ
    readJson.event.forEach((updateEventId) => {
        let baseJson = null

        try {
            let readText = fs.readFileSync(`./event/${updateEventId}.json`, 'utf-8')
            baseJson = JSON.parse(readText)
        } catch (error) {
            res.send({ "Error": 600 })
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

router.get('/eventdata/:id', (req, res, next) => {
    let readJson = null
    let returnJson = {}
    returnJson.data = []

    // イベント管理ファイルがあるか
    try {
        let readText = fs.readFileSync(`./event/${req.params.id}.json`, 'utf-8')
        readJson = JSON.parse(readText)
    } catch (error) {
        res.send({ "Error": 600 })
        return
    }

    res.json(readJson);
})

module.exports = router
