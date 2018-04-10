'use strict';

var errs = require('restify-errors');
var neighbours = require('../../db/neighbours');

module.exports = {
    addNeighbour: addNeighbour
};

function addNeighbour(req, res, next) {
    let neighbour = req.swagger.params.Neighbour.value;

    if (new RegExp(/[a-zA-Z]/).test(neighbour.phone)) {
        return next(new errs.InvalidContentError('phone can\'t be alphanumeric!'));
    }
    
    //TODO: Add neighbour to DB
    neighbours.add(neighbour);

    res.send(201, {message: 'Neighbour added!'});
    return next();
}