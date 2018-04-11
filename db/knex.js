'use strict';

var environment = process.env.ENV || 'dev';
var config = require('../knexfile.js')[environment];

module.exports = require('knex')(config);
