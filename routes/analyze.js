let express = require('express')
let router = express.Router()

router.get('/', (req, res, next) => {
    res.send('アクセス分析用');
})

router.get('/:page', (req, res, next) => {
    console.log('==========')
    console.log(req.params.page)
    console.log('==========')
    res.json({ 'analyze': true });
})

module.exports = router
