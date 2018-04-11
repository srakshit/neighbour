'use strict';

let env = process.env.ENV || 'dev';
let config = require('./' + env + '/config');

module.exports = config;
