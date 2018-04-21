'use strict';

var errs = require('restify-errors');
var subscribers = require('../../db/subscribers');

function addSubscriber(req, res, next) {
    let subscriber = req.swagger.params.Subscriber.value;
    subscriber.type = 'S';

    if (new RegExp(/[a-zA-Z]/).test(subscriber.phone)) {
        return next(new errs.InvalidContentError('phone number can\'t be alphanumeric!'));
    }

    let subscriberIdPrefix = subscriber.lastName.substr(0, 1).toUpperCase() + subscriber.firstName.substr(0, 1).toUpperCase() + subscriber.postcode.toUpperCase();

    subscribers.add(subscriber, subscriberIdPrefix)
        .then((id) => {
            res.send(201, {message: 'Subscriber ' + subscriber.firstName + ' ' + subscriber.lastName + ' added!', id: id[0]});
            return next();
        })
        .catch((err) => {
            let errMsg = err.message.toLowerCase();
            if (new RegExp(/unique constraint/).test(errMsg)) {
                if (new RegExp(/users.email/).test(errMsg) || new RegExp(/users_email_unique/).test(err)) {
                    return next(new errs.ConflictError('User with same email exists!'));
                } 
                if (new RegExp(/users.phone/).test(errMsg) || new RegExp(/users_phone_unique/).test(err)) {
                    return next(new errs.ConflictError('User with same phone number exists!'));
                }
            }
            return next(new errs.InternalServerError(err.message, 'Failed to create subscriber!'));
        });
}

function getSubscriber(req, res, next) {
    let id = req.swagger.params.id.value;
    
    subscribers.getById(id)
        .then((subscriber) => {
            if (subscriber) {
                res.send(200, subscriber);
                return next();
            }else {
                return next(new errs.NotFoundError('No matching subscriber found'))
            }
        })
        .catch((err) => {
            return next(new errs.InternalServerError(err.message, 'Failed to create subscriber!'));
        });
}


module.exports = {
    addSubscriber: addSubscriber,
    getSubscriber: getSubscriber
};