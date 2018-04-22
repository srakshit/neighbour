'use strict';

var should = require('should');
var request = require('supertest');
var server = require('../../../app');
var subscribers = require('../../../db/subscribers');

describe('controllers', () => {
    describe('GET /subscribers', () => {
        //Cleanup
        afterEach(() => 
            subscribers.getByEmail('test@test.com')
                .then((subscriber) => subscribers.deleteByUserId(subscriber.id).then()));

        describe('happy path', () => {
            it('should get a subscriber', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'address': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'TT7HX').then((id) => {

                    request(server)
                        .get('/api/v1/subscribers/' + id[0])
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.body.firstName.should.eql('test');
                            res.body.lastName.should.eql('test');
                            res.body.email.should.eql('test@test.com');
                            res.body.phone.should.eql('07777777777');
                            res.body.address.should.eql('test');
                            res.body.postcode.should.eql('WA37HX');
                            done();
                        });
                });
            });
        });

        describe('error paths', () => {
            it('should throw NotFound error when subscriber is not found', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'address': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'TT7HX').then((id) => {

                    request(server)
                        .get('/api/v1/subscribers/' + id[0]+'1')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(404)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.body.should.eql({ code: 'ResourceNotFound', message: 'No matching subscriber found!' });
                            done();
                        });
                });
            });
        });
    });

    describe('GET /subscribers/email', () => {
        //Cleanup
        afterEach(() => 
            subscribers.getByEmail('test@test.com')
                .then((subscriber) => subscribers.deleteByUserId(subscriber.id).then()));

        describe('happy path', () => {
            it('should get a subscriber', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'address': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'TT7HX').then((id) => {

                    request(server)
                        .get('/api/v1/subscribers/email/test@test.com')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.body.firstName.should.eql('test');
                            res.body.lastName.should.eql('test');
                            res.body.email.should.eql('test@test.com');
                            res.body.phone.should.eql('07777777777');
                            res.body.address.should.eql('test');
                            res.body.postcode.should.eql('WA37HX');
                            done();
                        });
                });
            });
        });

        describe('error paths', () => {
            it('should throw NotFound error when subscriber is not found', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'address': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'TT7HX').then((id) => {

                    request(server)
                        .get('/api/v1/subscribers/email/test1@test.com')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(404)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.body.should.eql({ code: 'ResourceNotFound', message: 'No matching subscriber found!' });
                            done();
                        });
                });
            });
        });
    });

    describe('POST /subscribers', () => {
        //Cleanup
        afterEach(() => 
            subscribers.getByEmail('test@test.com')
                .then((subscriber) => subscribers.deleteByUserId(subscriber.id).then()));

        describe('happy path', () => {
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
            beforeEach(() => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'address': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }).then();
            });

            it('should throw InvalidContent error if phone is alphanumeric', (done) => {
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

            it('should throw Conflict error if user with same email exists', (done) => {
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

            it('should throw Conflict error if user with same phone exists', (done) => {
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
