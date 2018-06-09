'use strict';

const errs = require('restify-errors');
const subscribers = require('../../db/subscribers');

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
                        return next(new errs.ResourceNotFoundError('Catcher with ref ' + catcher_ref + ' is not found!'));
                    }
                });
            }else {
                return next(new errs.ResourceNotFoundError('Subscriber with uid ' + subscriber_uid + ' is not found!'));
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
                        return next(new errs.ResourceNotFoundError('Catcher with ref ' + catcher_ref + ' is not found!'));
                    }
                });
            }else {
                return next(new errs.ResourceNotFoundError('Subscriber with uid ' + subscriber_uid + ' is not found!'));
            }
        });
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

module.exports = {
    allocateCatcherToSubscriber: allocateCatcherToSubscriber,
    updateCatcherAllocationForSubscriber: updateCatcherAllocationForSubscriber,
    getCatchersAllocatedToSubscriber: getCatchersAllocatedToSubscriber
};