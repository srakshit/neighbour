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
            if (new RegExp(/duplicate key value violates unique constraint/).test(err)) {
                if (new RegExp(/neighbours_email_unique/).test(err)) {
                    return next(new errs.ConflictError('Neighbour with same email exists!'));
                } else {
                    return next(new errs.ConflictError('Neighbour with same phone number exists!'));
                }
            }
            return next(new errs.InternalServerError(err, 'Failed to create neighbour!'));
        });
}