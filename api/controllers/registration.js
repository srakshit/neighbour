'use strict';

var errs = require('restify-errors');
var subscribers = require('../../db/subscribers');
var users = require('../../db/users');

module.exports = {
    addSubscriber: addSubscriber
};

function addSubscriber(req, res, next) {
    let user = req.swagger.params.Subscriber.value;
    user.type = 'S';

    if (new RegExp(/[a-zA-Z]/).test(user.phone)) {
        return next(new errs.InvalidContentError('phone number can\'t be alphanumeric!'));
    }

    users.add(user)
        .then((id) => {
            let subscriber = {
                user_id: parseInt(id),
                subscriber_id: 'SUBSCRIBER_'+id
            };
            
            subscribers.add(subscriber)
                    .then((id) => {
                        res.send(201, {message: 'Subscriber ' + user.firstName + ' ' + user.lastName + ' added!', id: id[0]});
                        return next();
                    })
                    .catch((err) => {
                        //TODO: Test this flow
                        let errMsg = err.message.toLowerCase();
                        users.deleteByEmail(user.email).then();
                        return next(new errs.InternalServerError(err.message, 'Failed to create subscriber!'));
                    });
            
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