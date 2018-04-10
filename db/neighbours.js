'use strict';

var knex = require('./knex.js');

function Neighbours() {
    return knex('neighbours');
}

function getAll() {
    return Neighbours().select();
}

function getByPhone(phone) {
    return Neighbours().where('phone', phone).first();
}

function getById(id) {
    return Neighbours().where('id', id).first();
}

function add(neighbour) {
    return Neighbours().insert(neighbour, 'id');
}

module.exports = {
    getAll: getAll,
    getByPhone: getByPhone,   
    getById: getById, 
    add: add
};