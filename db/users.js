'use strict';

let knex = require('./knex.js');

function Users() {
    return knex('users');
}

function getByEmail(email) {
    return Users().where('email', email).first();
}

function add(user) {
    return Users().insert(user, 'id');
}

function deleteByEmail(email) {
    return Users().where('email', email).del();
}

module.exports = {
    getByEmail: getByEmail, 
    add: add,
    deleteByEmail: deleteByEmail
};