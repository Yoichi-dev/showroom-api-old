'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.json({ title: 'Point History APIs' });
});

// 拡張機能接続確認用
router.get('/analyze/:page', (req, res, next) => {
  console.log('==========')
  console.log(req.params.page)
  console.log('==========')
  res.json({ 'analyze': true });
});

module.exports = router;
