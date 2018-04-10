'use strict';

var should = require('should');
var request = require('supertest');
var server = require('../../../app');
var neighbours = require('../../../db/neighbours');

describe('controllers', () => {
  describe('addNeighbour', () => {
    describe('POST /neighbours', () => {
      describe('happy path', () => {
        //Cleanup
        after(() => neighbours.deleteByPhone('07777777777').then());

        it('should add a neighbour', (done) => {
          request(server)
            .post('/neighbours')
            .send({
              'name': 'test',
              'email': 'test@test.com',
              'phone': '07777777777',
              'address': 'test',
              'postcode': 'WA37HX'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({message: 'Neighbour test added!'});
              done();
            });
        });
      });

      describe('error paths', () => {
        //Setup
        before(() => {
          neighbours.add({
            'name': 'test',
            'email': 'test@test.com',
            'phone': '07777777777',
            'address': 'test',
            'postcode': 'WA37HX'
          }).then();
        });

        //Teardown
        after(() => neighbours.deleteByPhone('07777777777').then());

        it('should throw error if phone is alphanumeric', (done) => {
          request(server)
            .post('/neighbours')
            .send({
              'name': 'test',
              'email': 'test@test.com',
              'phone': 'abcdefghijk',
              'address': 'test',
              'postcode': 'WA37HX'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: 'InvalidContent', message: 'phone number can\'t be alphanumeric!' });
              done();
            });
        });

        it('should throw error if neighbour with same email exists', (done) => {
          request(server)
            .post('/neighbours')
            .send({
              'name': 'test',
              'email': 'test@test.com',
              'phone': '07777777777',
              'address': 'test',
              'postcode': 'WA37HX'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: 'Conflict', message: 'Neighbour with same email exists!' });
              done();
            });
        });

        it('should throw error if neighbour with same phone exists', (done) => {
          request(server)
            .post('/neighbours')
            .send({
              'name': 'test',
              'email': 'test1@test.com',
              'phone': '07777777777',
              'address': 'test',
              'postcode': 'WA37HX'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: 'Conflict', message: 'Neighbour with same phone number exists!' });
              done();
            });
        });
      });
    });
  });
});
