'use strict';

const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const subscribers = require('../../../db/subscribers');
const generate = require('nanoid/generate');

let uid = () => generate('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 22);

describe('controllers', () => {
    describe('GET /subscribers', () => {
        //Cleanup
        afterEach(() => 
            subscribers.getByEmail('test@test.com')
                .then((subscriber) => subscribers.deleteByUserId(subscriber.id).then()));

        describe('happy path', () => {
            it('should get a subscriber by id', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
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
                            res.body.city.should.eql('test');
                            res.body.county.should.eql('test');
                            res.body.postcode.should.eql('WA37HX');
                            done();
                        });
                });
            });

            it('should get a subscriber by uid', (done) => {
                request(server)
                    .post('/api/v1/subscribers/')
                    .send({
                        'firstName': 'test',
                        'lastName': 'test',
                        'email': 'test@test.com',
                        'phone': '07777777777',
                        'uid': 'usr_' + uid(),
                        'address': 'test',
                        'city': 'test',
                        'county': 'test',
                        'postcode': 'WA37HX',
                        'type': 'C'                
                    })
                    .end((err, res) => {
                        request(server)
                            .get('/api/v1/subscribers/' + res.body.uid)
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
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
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
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
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
                            res.body.city.should.eql('test');
                            res.body.county.should.eql('test');
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
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
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
                        'uid': 'usr_' + uid(),
                        'address': 'test',
                        'city': 'test',
                        'county': 'test',
                        'postcode': 'WA3 7HX',
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
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
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
                        'uid': 'usr_' + uid(),
                        'address': 'test',
                        'city': 'test',
                        'county': 'test',
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
                        'uid': 'usr_' + uid(),
                        'address': 'test',
                        'city': 'test',
                        'county': 'test',
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
                        'uid': 'usr_' + uid(),
                        'address': 'test',
                        'city': 'test',
                        'county': 'test',
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

    describe('PUT /subscribers', () => {
        //Cleanup
        afterEach(() => 
            subscribers.getByEmail('test@test.com')
                .then((subscriber) => subscribers.deleteByUserId(subscriber.id).then()));

        describe('happy path', () => {
            it('should update a subscriber when all fields are provided', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'CTT7HX').then((id) => {
                    request(server)
                        .put('/api/v1/subscribers')
                        .send({
                            'id': id[0],
                            'firstName': 'test1',
                            'lastName': 'test1',
                            'email': 'test@test.com',
                            'phone': '07777777778',
                            'address': 'test1',
                            'city': 'test1',
                            'county': 'test1',
                            'postcode': 'WA2 7GA',
                            'isActive' : false
                        })
                        .set('Accept', 'application/json')
                        .expect(204)
                        .end((err, res) => {
                            should.not.exist(err);
                            subscribers.getByEmail('test@test.com')
                                    .then((subscriber) => {
                                        subscriber.firstName.should.eql('test1');
                                        subscriber.lastName.should.eql('test1');
                                        subscriber.phone.should.eql('07777777778');
                                        subscriber.address.should.eql('test1');
                                        subscriber.city.should.eql('test1');
                                        subscriber.county.should.eql('test1');
                                        subscriber.postcode.should.eql('WA27GA');
                                        subscriber.isActive.should.eql(false);
                                        done();
                                    });
                        });

                });
            });

            it('should update a subscriber when few personal detail fields are upadted', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'CTT7HX').then((id) => {
                    request(server)
                        .put('/api/v1/subscribers')
                        .send({
                            'id': id[0],
                            'email': 'test@test.com',
                            'address': 'test1',
                            'city': 'test1',
                            'county': 'test1',
                            'postcode': 'WA27GA'
                        })
                        .set('Accept', 'application/json')
                        .expect(204)
                        .end((err, res) => {
                            should.not.exist(err);
                            subscribers.getByEmail('test@test.com')
                                    .then((subscriber) => {
                                        subscriber.firstName.should.eql('test');
                                        subscriber.address.should.eql('test1');
                                        subscriber.city.should.eql('test1');
                                        subscriber.county.should.eql('test1');
                                        subscriber.postcode.should.eql('WA27GA');
                                        done();
                                    });
                        });

                });
            });

            it('should update a subscriber when status field and stripe customer id is updated', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'CTT7HX').then((id) => {
                    request(server)
                        .put('/api/v1/subscribers')
                        .send({
                            'id': id[0],
                            'email': 'test@test.com',
                            'isActive': false,
                            'stripeCustomerId': 'test_cus_123456789'
                        })
                        .set('Accept', 'application/json')
                        .expect(204)
                        .end((err, res) => {
                            should.not.exist(err);
                            subscribers.getByEmail('test@test.com')
                                    .then((subscriber) => {
                                        subscriber.firstName.should.eql('test');
                                        subscriber.isActive.should.eql(false);
                                        subscriber.stripe_customer_id.should.eql('test_cus_123456789');
                                        done();
                                    });
                        });

                });
            });
        });
    });

    describe('PUT /subscribers/{uid}', () => {
        //Cleanup
        afterEach(() => 
            subscribers.getByEmail('test@test.com')
                .then((subscriber) => subscribers.deleteByUserId(subscriber.id).then()));

        describe('happy path', () => {
            it('should update a subscriber when all fields are provided', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'CTT7HX').then((id) => {
                    subscribers.getById(id[0]).then((subscriber) => {
                        request(server)
                            .put('/api/v1/subscribers/' + subscriber.uid)
                            .send({
                                'firstName': 'test1',
                                'lastName': 'test1',
                                'phone': '07777777778',
                                'address': 'test1',
                                'city': 'test1',
                                'county': 'test1',
                                'postcode': 'WA2 7GA',
                                'isActive' : false
                            })
                            .set('Accept', 'application/json')
                            .expect(204)
                            .end((err, res) => {
                                should.not.exist(err);
                                subscribers.getByEmail('test@test.com')
                                        .then((subscriber) => {
                                            subscriber.firstName.should.eql('test1');
                                            subscriber.lastName.should.eql('test1');
                                            subscriber.phone.should.eql('07777777778');
                                            subscriber.address.should.eql('test1');
                                            subscriber.city.should.eql('test1');
                                            subscriber.county.should.eql('test1');
                                            subscriber.postcode.should.eql('WA27GA');
                                            subscriber.isActive.should.eql(false);
                                            done();
                                        });
                            });
                    });

                });
            });

            it('should update a subscriber when few personal detail fields are upadted', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'CTT7HX').then((id) => {
                    subscribers.getById(id[0]).then((subscriber) => {
                        request(server)
                        .put('/api/v1/subscribers/' + subscriber.uid)
                        .send({
                            'address': 'test1',
                            'city': 'test1',
                            'county': 'test1',
                            'postcode': 'WA27GA'
                        })
                        .set('Accept', 'application/json')
                        .expect(204)
                        .end((err, res) => {
                            should.not.exist(err);
                            subscribers.getByEmail('test@test.com')
                                    .then((subscriber) => {
                                        subscriber.firstName.should.eql('test');
                                        subscriber.address.should.eql('test1');
                                        subscriber.city.should.eql('test1');
                                        subscriber.county.should.eql('test1');
                                        subscriber.postcode.should.eql('WA27GA');
                                        done();
                                    });
                        });
                    });
                });
            });

            it('should update a subscriber when status field and stripe customer id is updated', (done) => {
                subscribers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'test@test.com',
                    'phone': '07777777777',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'S'
                }, 'CTT7HX').then((id) => {
                    subscribers.getById(id[0]).then((subscriber) => {
                        request(server)
                            .put('/api/v1/subscribers/' + subscriber.uid)
                            .send({
                                'isActive': false,
                                'stripeCustomerId': 'test_cus_123456789'
                            })
                            .set('Accept', 'application/json')
                            .expect(204)
                            .end((err, res) => {
                                should.not.exist(err);
                                subscribers.getByEmail('test@test.com')
                                        .then((subscriber) => {
                                            subscriber.firstName.should.eql('test');
                                            subscriber.isActive.should.eql(false);
                                            subscriber.stripe_customer_id.should.eql('test_cus_123456789');
                                            done();
                                        });
                            });
                    });

                });
            });
        });
    });
});
