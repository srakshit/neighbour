"use strict";

var errs = require("restify-errors");

module.exports = {
    createNeighbour: createNeighbour
};

function createNeighbour(req, res, next) {
    let neighbourDetails = req.swagger.params.NeighbourDetails.value;

    if (new RegExp(/[a-zA-Z]/).test(neighbourDetails.phone)) {
        return next(new errs.InvalidContentError("phone can't be alphanumeric!"));
    }
    
    //TODO: Add neighbour to DB

    res.send(201, {message: "Neighbour created!"});
    return next();
}