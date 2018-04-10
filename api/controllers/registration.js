"use strict"

var errs = require("restify-errors");
var validator = require("validator");

module.exports = {
    createNeighbour: createNeighbour
};

function createNeighbour(req, res, next) {
    let neighbourDetails = req.swagger.params["NeighbourDetails"].value;

    //Validate all fields have non-empty strings
    for(var key in neighbourDetails) {
        if (neighbourDetails[key] == "") {
            return next(new errs.InvalidContentError(key + " is empty!"));
        } else {
            switch(key) {
                case "email" :
                    if (!validator.isEmail(neighbourDetails[key])) {
                        return next(new errs.InvalidContentError(key + " is invalid!"));
                    }
                    break;
                case "phone" :
                    if (!validator.isMobilePhone(neighbourDetails[key], "en-GB")) {
                        return next(new errs.InvalidContentError(key + " is invalid!"));
                    }
                    break;
                case "postcode" :
                    if (!validator.isPostalCode(neighbourDetails[key], "GB")) {
                        return next(new errs.InvalidContentError(key + " is invalid!"));
                    }
            }
        }
    }
    
    //TODO: Add neighbour to DB

    res.send(201, {message: "Neighbour created!"});
    return next();
}