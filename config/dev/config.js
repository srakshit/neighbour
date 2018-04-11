'use strict';

let _ = require('lodash');
let conf = require('../config');

let devConf = {};

module.exports = _.merge({}, conf, devConf);