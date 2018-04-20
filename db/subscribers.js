'use strict';

let knex = require('./knex.js');

function Subscribers() {
    return knex('subscribers');
}

function getByEmail(email) {
    return Subscribers()
            .innerJoin('users', 'subscribers.user_id', 'users.id')
            .where('email', email)
            .first();
}

function getById(id) {
    return Subscribers()
            .innerJoin('users', 'subscribers.user_id', 'users.id')
            .where('id', id)
            .first();
}

function add(subscriber) {
    return Subscribers().insert(subscriber, 'subscriber_id');
}

function deleteById(id) {
    return Subscribers().where('user_id', id).del();
}

module.exports = {
    getByEmail: getByEmail,
    getById: getById,
    add: add,
    deleteById: deleteById
};