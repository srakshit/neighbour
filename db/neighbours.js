'use strict';

var knex = require('./knex.js');

function Neighbours() {
    return knex('neighbours');
}

function getAll() {
    return Neighbours().select();
}

function getSingle(phone) {
    return Neighbours().where('phone', phone).first();
}

function add(neighbour) {
    return Neighbours.insert(neighbour, 'id');
}

module.exports = {
    getAll: getAll,
    getSingle: getSingle,
    add: add
};