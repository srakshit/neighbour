'use strict';

var should = require('should');
var request = require('supertest');
var server = require('../../../app');
var users = require('../../../db/users');
var subscribers = require('../../../db/subscribers');

describe('controllers', () => {
  describe('addSubscriber', () => {
    describe('POST /subscribers', () => {
      describe('happy path', () => {
        //Cleanup
        after(() => 
          users.getByEmail('test@test.com')
                .then((user) => subscribers.deleteById(user.id))
                .then(() => users.deleteByEmail('test@test.com').then()));

        it('should add a subscriber', (done) => {
          request(server)
            .post('/api/v1/subscribers')
            .send({
              'firstName': 'test',
              'lastName': 'test',
              'email': 'test@test.com',
              'phone': '07777777777',
              'address': 'test',
              'postcode': 'WA37HX',
              'type': 'S'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201)
            .end((err, res) => {
              should.not.exist(err);
              res.body.message.should.eql('Subscriber test test added!');
              done();
            });
        });
      });

      describe('error paths', () => {
        //Setup
        before(() => {
          users.add({
            'firstName': 'test',
            'lastName': 'test',
            'email': 'test@test.com',
            'phone': '07777777777',
            'address': 'test',
            'postcode': 'WA37HX',
            'type': 'S'
          }).then();
        });

        //Teardown
        after(() => 
          users.getByEmail('test@test.com')
                .then((user) => subscribers.deleteById(user.id))
                .then(() => users.deleteByEmail('test@test.com').then()));

        it('should throw error if phone is alphanumeric', (done) => {
          request(server)
            .post('/api/v1/subscribers')
            .send({
              'firstName': 'test',
              'lastName': 'test',
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

        it('should throw error if user with same email exists', (done) => {
          request(server)
            .post('/api/v1/subscribers')
            .send({
              'firstName': 'test',
              'lastName': 'test',
              'email': 'test@test.com',
              'phone': '07777777778',
              'address': 'test',
              'postcode': 'WA37HX'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(409)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: 'Conflict', message: 'User with same email exists!' });
              done();
            });
        });

        it('should throw error if user with same phone exists', (done) => {
          request(server)
            .post('/api/v1/subscribers')
            .send({
              'firstName': 'test',
              'lastName': 'test',
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
              res.body.should.eql({ code: 'Conflict', message: 'User with same phone number exists!' });
              done();
            });
        });
      });
    });
  });
});
