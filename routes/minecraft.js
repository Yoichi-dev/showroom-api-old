'use strict';

let express = require('express');
let router = express.Router();
let pinger = require('minecraft-pinger');

router.get('/', (req, res, next) => {
  pinger.ping('minecraft.yoichi.dev', 4466, (error, result) => {
    error ? res.json({}) : res.json(result);
  })
});

module.exports = router;
