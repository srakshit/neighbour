'use strict';

const _ = require('lodash');
const moment = require('moment');
const knex = require('./knex.js');

function Users() {
    return knex('users');
}

function Subscribers() {
    return knex('subscribers');
}

function Catchers() {
    return knex('catchers');
}

function CatcherAllocation() {
    return knex('catcher_allocation');
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

function getCatcherById(id) {
    return Catchers()
            .innerJoin('users', 'catchers.user_id', 'users.id')
            .where('catcher_id', id)
            .first();
}

function getByUid(uid) {
    return Subscribers()
            .innerJoin('users', 'subscribers.user_id', 'users.id')
            .where('uid', uid)
            .first();
}

function getCatchersAllocatedToSubscriber(uid) {
    return CatcherAllocation()
            .innerJoin('users as u1', 'catcher_allocation.subscriber_id', 'u1.id')
            .innerJoin('subscribers', 'catcher_allocation.subscriber_id', 'subscribers.user_id')
            .innerJoin('users as u2', 'catcher_allocation.catcher_id', 'u2.id')
            .innerJoin('catchers', 'catcher_allocation.catcher_id', 'catchers.user_id')
            .where('u1.uid', uid)
            .select('catchers.catcher_id as ref_id'
                ,'u2.uid'
                ,'u2.firstName'
                ,'u2.lastName'
                ,'u2.address'
                ,'u2.city'
                ,'u2.county'
                ,'u2.postcode'
                ,'u2.phone'
                ,'u2.email');
}

function add(subscriber, subscriberIdPrefix) {
    subscriber.created_at = moment().format('YYYY-MM-DD HH:mm:ss');

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

    userObj.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    
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

    if (subscriber.id) {
        return getById(subscriber.id)
            .then((subscriber) => {
                return updateSubscriber(subscriber.id, userObj, subscriberObj);
            })
    }

    if (subscriber.uid) {
        return getByUid(subscriber.uid)
            .then((subscriber) => {
                return updateSubscriber(subscriber.id, userObj, subscriberObj);
            })
    } 
}

function updateSubscriber(user_id, userObj, subscriberObj) {

    if (!_.isEmpty(subscriberObj)) {
        //Update both Users and Subscribers table
        return knex.transaction((t) => {
            return Users()
                .transacting(t)
                .where('id', user_id)
                .update(userObj)
                .then((id) => {
                    return Subscribers()
                        .transacting(t)
                        .where('user_id', user_id)
                        .update(subscriberObj);
                })
                .then(t.commit)
                .catch(t.rollback);
        });
    }else {
        //Update Users table only
        return knex.transaction((t) => {
            return Users()
                .transacting(t)
                .where('id', user_id)
                .update(userObj)
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

function allocateCatcher(catcher_id, subscriber_id) {
    return CatcherAllocation()
            .insert({catcher_id: catcher_id, subscriber_id: subscriber_id, created_at: moment().format('YYYY-MM-DD HH:mm:ss')});
}

function updateCatcherAllocation(catcher_id, subscriber_id) {
    return CatcherAllocation()
            .where({ subscriber_id: subscriber_id })
            .update({ catcher_id: catcher_id, updated_at: moment().format('YYYY-MM-DD HH:mm:ss') });
}

module.exports = {
    getByEmail: getByEmail,
    getById: getById,
    getByUid: getByUid,
    getCatcherById: getCatcherById,
    add: add,
    deleteByUserId: deleteByUserId,
    update: update,
    getCatchersAllocatedToSubscriber: getCatchersAllocatedToSubscriber,
    allocateCatcher: allocateCatcher,
    updateCatcherAllocation: updateCatcherAllocation
};