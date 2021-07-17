'use strict';

let express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.json({ title: 'Point History APIs' });
});

module.exports = router;
