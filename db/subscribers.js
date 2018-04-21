'use strict';

const _ = require('lodash');
const knex = require('./knex.js');

function Users() {
    return knex('users');
}

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
            .where('subscriber_id', id)
            .first();
}

function add(subscriber, subscriberIdPrefix) {  
    return knex.transaction(function (t) {
        return Users()
            .transacting(t)
            .insert(subscriber, 'id')
            .then(function (id) {
                return Subscribers()
                    .transacting(t)
                    .insert({subscriber_id: subscriberIdPrefix + _.padStart(id[0], 6, '0'), user_id: id[0]}, 'subscriber_id')
            })
            .then(t.commit)
            .catch(t.rollback)
    });
}

function deleteByUserId(id) {
    return knex.transaction(function (t) {
        return Subscribers()
            .transacting(t)
            .del()
            .where('user_id', id)
            .then(function (response) {
                return Users()
                    .transacting(t)
                    .del()
                    .where('id', id)
            })
            .then(t.commit)
            .catch(t.rollback)
    });
}

module.exports = {
    getByEmail: getByEmail,
    getById: getById,
    add: add,
    deleteByUserId: deleteByUserId
};