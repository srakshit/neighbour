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

function getByUid(uid) {
    return Subscribers()
            .innerJoin('users', 'subscribers.user_id', 'users.id')
            .where('uid', uid)
            .first();
}

function add(subscriber, subscriberIdPrefix) {  
    return knex.transaction((t) => {
        return Users()
            .transacting(t)
            .insert(subscriber, 'id')
            .then((id) => {
                return Subscribers()
                    .transacting(t)
                    .insert({subscriber_id: subscriberIdPrefix + _.padStart(id[0], 6, '0'), user_id: id[0]}, 'subscriber_id')
            })
            .then(t.commit)
            .catch(t.rollback);
    });
}

function update(subscriber) {
    let userObj = {};
    let subscriberObj = {};
    
    if (subscriber.firstName) {
        userObj.firstName = subscriber.firstName;
    }
    if (subscriber.lastName) {
        userObj.lastName = subscriber.lastName;
    }
    if (subscriber.address) {
        userObj.address = subscriber.address;
    }
    if (subscriber.city) {
        userObj.city = subscriber.city;
    }
    if (subscriber.county) {
        userObj.county = subscriber.county;
    }
    if (subscriber.postcode) {
        userObj.postcode = subscriber.postcode;
    }
    if (subscriber.phone) {
        userObj.phone = subscriber.phone;
    }
    if (subscriber.firstName) {
        userObj.firstName = subscriber.firstName;
    }

    if (subscriber.isActive !== undefined) {
        subscriberObj.isActive = subscriber.isActive;
    }

    if (subscriber.stripeCustomerId !== undefined) {
        subscriberObj.stripe_customer_id = subscriber.stripeCustomerId;
    }
    
    if (!_.isEmpty(userObj) && !_.isEmpty(subscriberObj)) {
        //Update both Users and Subscribers table
        return knex.transaction((t) => {
            return Users()
                .transacting(t)
                .where('email', subscriber.email)
                .update(userObj)
                .then(function (id) {
                    return Subscribers()
                        .transacting(t)
                        .where('subscriber_id', subscriber.id)
                        .update(subscriberObj);
                })
                .then(t.commit)
                .catch(t.rollback);
        });
    }else if (!_.isEmpty(userObj)){
        //Update Users table only
        return knex.transaction((t) => {
            return Users()
                .transacting(t)
                .where('email', subscriber.email)
                .update(userObj)
                .then(t.commit)
                .catch(t.rollback);
        });
    }else if (!_.isEmpty(subscriberObj)) {
        //Update Subscribers table only
        return knex.transaction((t) => {
            return Subscribers()
                .transacting(t)
                .where('subscriber_id', subscriber.id)
                .update(subscriberObj)
                .then(t.commit)
                .catch(t.rollback);
        });
    }   
}

function deleteByUserId(id) {
    return knex.transaction((t) => {
        return Subscribers()
            .transacting(t)
            .del()
            .where('user_id', id)
            .then(() => {
                return Users()
                    .transacting(t)
                    .del()
                    .where('id', id);
            })
            .then(t.commit)
            .catch(t.rollback);
    });
}

module.exports = {
    getByEmail: getByEmail,
    getById: getById,
    getByUid: getByUid,
    add: add,
    deleteByUserId: deleteByUserId,
    update: update
};