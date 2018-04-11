'use strict';

var errs = require('restify-errors');
var neighbours = require('../../db/neighbours');

module.exports = {
    addNeighbour: addNeighbour
};

function addNeighbour(req, res, next) {
    let neighbour = req.swagger.params.Neighbour.value;

    if (new RegExp(/[a-zA-Z]/).test(neighbour.phone)) {
        return next(new errs.InvalidContentError('phone number can\'t be alphanumeric!'));
    }

    neighbours.add(neighbour)
        .then(() => {
            res.send(201, {message: 'Neighbour ' + neighbour.name + ' added!'});
            return next();
        })
        .catch((err) => {
            let errMsg = err.message.toLowerCase();
            if (new RegExp(/unique constraint/).test(errMsg)) {
                if (new RegExp(/neighbours.email/).test(errMsg) || new RegExp(/neighbours_email_unique/).test(err)) {
                    return next(new errs.ConflictError('Neighbour with same email exists!'));
                } 
                if (new RegExp(/neighbours.phone/).test(errMsg) || new RegExp(/neighbours_phone_unique/).test(err)) {
                    return next(new errs.ConflictError('Neighbour with same phone number exists!'));
                }
            }
            return next(new errs.InternalServerError(err.message, 'Failed to create neighbour!'));
        });
}