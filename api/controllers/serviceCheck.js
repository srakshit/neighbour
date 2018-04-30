'use strict';

function getPong(req, res, next) {
    res.send(200, {message: 'pong'});
    return next();
}

module.exports = {
    getPong: getPong
};