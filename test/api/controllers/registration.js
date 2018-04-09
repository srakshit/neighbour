var should = require("should");
var request = require("supertest");
var server = require("../../../app");

describe("controllers", function() {
  describe("createNeighbour", function() {
    describe("POST /neighbour", function() {
      it("should create a neighbour", function(done) {
        request(server)
          .post("/neighbour")
          .send({
            "name": "Sherlock Holmes",
            "email": "sherlock.holmes@catchernet.com",
            "phone": "07845678903",
            "address": "221B Baker Street",
            "postcode": "SW19 2JG"
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
          .end(function(err, res) {
            should.not.exist(err);
            res.body.should.eql({message: "Neighbour created!"});
            done();
          });
      });

      describe("should throw error", function() {
        it("if email is invalid", function(done) {
          request(server)
            .post("/neighbour")
            .send({
              "name": "Sherlock Holmes",
              "email": "@catchernet.com",
              "phone": "07845678903",
              "address": "221B Baker Street",
              "postcode": "SW19 2JG"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.should.eql({ code: "InvalidContent", message: "email is invalid!" });
              done();
            });
        });

        it("if phone is invalid", function(done) {
          request(server)
            .post("/neighbour")
            .send({
              "name": "Sherlock Holmes",
              "email": "sherlock.holmes@catchernet.com",
              "phone": "a07845678903",
              "address": "221B Baker Street",
              "postcode": "SW19 2JG"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.should.eql({ code: "InvalidContent", message: "phone is invalid!" });
              done();
            });
        });

        it("if postcode is invalid", function(done) {
          request(server)
            .post("/neighbour")
            .send({
              "name": "Sherlock Holmes",
              "email": "sherlock.holmes@catchernet.com",
              "phone": "07845678903",
              "address": "221B Baker Street",
              "postcode": "SW"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400)
            .end(function(err, res) {
              should.not.exist(err);
              res.body.should.eql({ code: "InvalidContent", message: "postcode is invalid!" });
              done();
            });
        });
      });
    });
  });
});
