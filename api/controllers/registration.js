'use strict';

const errs = require('restify-errors');
const subscribers = require('../../db/subscribers');
const generate = require('nanoid/generate');

let uid = () => generate('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 22);

function addSubscriber(req, res, next) {
    let subscriber = req.swagger.params.subscriber.value;
    subscriber.type = 'S';

    if (new RegExp(/[a-zA-Z]/).test(subscriber.phone)) {
        return next(new errs.InvalidContentError('phone number can\'t be alphanumeric!'));
    }

    subscriber.postcode = subscriber.postcode.replace(' ', '');
    subscriber.uid = 'usr_' + uid();

    let subscriberIdPrefix = 'S' + subscriber.lastName.substr(0, 1).toUpperCase() + subscriber.firstName.substr(0, 1).toUpperCase() + subscriber.postcode.toUpperCase();

    subscribers.add(subscriber, subscriberIdPrefix)
        .then((id) => {
            subscribers.getById(id[0])
                .then((newSubscriber) => {
                    res.send(201, {message: 'Subscriber ' + subscriber.firstName + ' ' + subscriber.lastName + ' added!', id: id[0], uid: newSubscriber.uid});
                    return next();
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
            //TODO: Test code path
            return next(new errs.InternalError(err.message, 'Failed to create subscriber!'));
        });
}

function updateSubscriber(req, res, next) {
    let subscriber = req.swagger.params.subscriber.value;

    if (subscriber.postcode) {
        subscriber.postcode = subscriber.postcode.replace(' ', '');
    }

    if (subscriber.phone && new RegExp(/[a-zA-Z]/).test(subscriber.phone)) {
        return next(new errs.InvalidContentError('phone number can\'t be alphanumeric!'));
    }

    subscribers.update(subscriber)
        .then(() => {
            res.send(204);
            return next();
        })
        .catch((err) => {
            console.log(err);
            return next(new errs.InternalError(err.message, 'Failed to create subscriber!'));
        });
}

function getSubscriberbyId(req, res, next) {
    let id = req.swagger.params.uid.value;
    
    if (id.startsWith('usr_')) {
        subscribers.getByUid(id)
            .then((subscriber) => {
                if (subscriber) {
                    subscribers.getCatchersAllocatedToSubscriber(subscriber.uid)
                        .then((allocatedCatcher) => {
                            subscriber.catcher = allocatedCatcher;
                            delete subscriber.id;
                            delete subscriber.user_id;
                            res.send(200, subscriber);
                            return next();
                    });
                }else {
                    return next(new errs.ResourceNotFoundError('No matching subscriber found!'))
                }
            })
            .catch((err) => {
                //TODO: Test code path
                return next(new errs.InternalError(err.message, 'Failed to retrieve subscriber!'));
            });
    }else {
        subscribers.getById(id)
            .then((subscriber) => {
                if (subscriber) {
                    subscribers.getCatchersAllocatedToSubscriber(subscriber.uid)
                        .then((allocatedCatcher) => {
                            subscriber.catcher = allocatedCatcher;
                            delete subscriber.id;
                            delete subscriber.user_id;
                            res.send(200, subscriber);
                            return next();
                    });
                }else {
                    return next(new errs.ResourceNotFoundError('No matching subscriber found!'))
                }
            })
            .catch((err) => {
                //TODO: Test code path
                return next(new errs.InternalError(err.message, 'Failed to retrieve subscriber!'));
            });
    }
}

function getCatchersAllocatedToSubscriber(req, res, next) {
    let uid = req.swagger.params.uid.value;
    
    subscribers.getCatchersAllocatedToSubscriber(uid)
            .then((allocatedCatcher) => {
                if (allocatedCatcher) {
                    res.send(200, allocatedCatcher);
                    return next();
                }else {
                    return next(new errs.ResourceNotFoundError('No catcher is allocated to the subscriber!'))
                }
            })
            .catch((err) => {
                //TODO: Test code path
                return next(new errs.InternalError(err.message, 'Failed to retrieve catcher allocation to subscriber'));
            });
}

function getSubscriberByEmail(req, res, next) {
    let email = req.swagger.params.email.value;
    
    subscribers.getByEmail(email)
        .then((subscriber) => {
            if (subscriber) {
                res.send(200, subscriber);
                return next();
            }else {
                return next(new errs.ResourceNotFoundError('No matching subscriber found!'))
            }
        })
        .catch((err) => {
            //TODO: Test code path
            return next(new errs.InternalError(err.message, 'Failed to retrieve subscriber!'));
        });
}

function allocateCatcherToSubscriber(req, res, next) {
    let subscriber_uid = req.swagger.params.uid.value;
    let catcher_ref = req.swagger.params.catcherRef.value;
    
    subscribers.getByUid(subscriber_uid)
        .then((subscriber) => {
            if (subscriber) {
                subscribers.getCatcherById(catcher_ref)
                .then((catcher) => {
                    if (catcher) {
                        subscribers.allocateCatcher(catcher.id, subscriber.id)
                            .then(() => {
                                res.send(201, {
                                    message: 'Subscriber ' + subscriber.firstName + ' ' + subscriber.lastName + ' is allocated to catcher ' + catcher.firstName + ' ' + catcher.lastName, 
                                    catcher_ref: catcher.catcher_id, 
                                    subscriber_ref: subscriber.subscriber_id
                                });
                                return next();
                            })
                            .catch((err) => {
                                let errMsg = err.message.toLowerCase();
                                if (new RegExp(/unique constraint/).test(errMsg)) {
                                    return next(new errs.ConflictError('Catcher is already allocated to subscriber!'));
                                }
                                //TODO: Test code path
                                return next(new errs.InternalError(err.message, 'Failed to allocate catcher to subscriber!'));
                            });
                    }else {
                        return next(new errs.ResourceNotFoundError('Catcher with ref ' + catcher_ref + 'is not found!'));
                    }
                });
            }else {
                return next(new errs.ResourceNotFoundError('Subscriber with uid ' + subscriber_uid + 'is not found!'));
            }
        });
}

function updateCatcherAllocationForSubscriber(req, res, next) {
    let subscriber_uid = req.swagger.params.uid.value;
    let catcher_ref = req.swagger.params.catcherRef.value;
    
    subscribers.getByUid(subscriber_uid)
        .then((subscriber) => {
            if (subscriber) {
                subscribers.getCatcherById(catcher_ref)
                .then((catcher) => {
                    if (catcher) {
                        subscribers.updateCatcherAllocation(catcher.id, subscriber.id)
                            .then(() => {
                                res.send(200, {
                                    message: 'Subscriber ' + subscriber.firstName + ' ' + subscriber.lastName + ' is now allocated to catcher ' + catcher.firstName + ' ' + catcher.lastName, 
                                    catcher_ref: catcher.catcher_id, 
                                    subscriber_ref: subscriber.subscriber_id
                                });
                                return next();
                            })
                            .catch((err) => {
                                return next(new errs.InternalError(err.message, 'Failed to allocate catcher to subscriber!'));
                            });
                    }else {
                        return next(new errs.ResourceNotFoundError('Catcher with ref ' + catcher_ref + 'is not found!'));
                    }
                });
            }else {
                return next(new errs.ResourceNotFoundError('Subscriber with uid ' + subscriber_uid + 'is not found!'));
            }
        });
}


module.exports = {
    addSubscriber: addSubscriber,
    updateSubscriber: updateSubscriber,
    getSubscriberbyId: getSubscriberbyId,
    getSubscriberByEmail: getSubscriberByEmail,
    getCatchersAllocatedToSubscriber: getCatchersAllocatedToSubscriber,
    allocateCatcherToSubscriber: allocateCatcherToSubscriber,
    updateCatcherAllocationForSubscriber: updateCatcherAllocationForSubscriber
};