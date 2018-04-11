'use strict';

let _ = require('lodash');
let conf = require('../config');

let localConf = {};

module.exports = _.merge({}, conf, localConf);