'use strict';

var should = require('should');
var request = require('supertest');
var server = require('../../../app');

describe('controllers', () => {
  describe('addNeighbour', () => {
    describe('POST /neighbours', () => {
      it('should add a neighbour', (done) => {
        request(server)
          .post('/neighbours')
          .send({
            'name': 'test',
            'email': 'test@test.com',
            'phone': '07777777777',
            'address': 'test',
            'postcode': 'SW192JG'
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

      describe('should throw error', () => {
        it('if phone is alphanumeric', (done) => {
          request(server)
            .post('/neighbours')
            .send({
              'name': 'abcd',
              'email': 'abcd@catchernet.com',
              'phone': 'abcdefghijk',
              'address': '221B Baker Street',
              'postcode': 'SW192JG'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
              should.not.exist(err);
              res.body.should.eql({ code: 'InvalidContent', message: 'phone can\'t be alphanumeric!' });
              done();
            });
        });
      });
    });
  });
});
