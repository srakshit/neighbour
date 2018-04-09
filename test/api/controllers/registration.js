var should = require("should");
var request = require("supertest");
var server = require("../../../app");

describe("controllers", () => {
  describe("createNeighbour", () => {
    describe("POST /neighbour", () => {
      it("should create a neighbour", (done) => {
        request(server)
          .post("/neighbours")
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
          .end((err, res) => {
            should.not.exist(err);
            res.body.should.eql({message: "Neighbour created!"});
            done();
          });
      });

      describe("should throw error", () => {
        it("if email is invalid", (done) => {
          request(server)
            .post("/neighbours")
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
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: "InvalidContent", message: "email is invalid!" });
              done();
            });
        });

        it("if phone is invalid", (done) => {
          request(server)
            .post("/neighbours")
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
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: "InvalidContent", message: "phone is invalid!" });
              done();
            });
        });

        it("if postcode is invalid", (done) => {
          request(server)
            .post("/neighbours")
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
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: "InvalidContent", message: "postcode is invalid!" });
              done();
            });
        });
      });
    });
  });
});
