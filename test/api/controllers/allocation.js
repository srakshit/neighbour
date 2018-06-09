'use strict';

const should = require('should');
const request = require('supertest');
const server = require('../../../app');
const subscribers = require('../../../db/subscribers');
const catchers = require('../../db/catchers');
const generate = require('nanoid/generate');

let uid = () => generate('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 22);

describe('controllers', () => {
    describe('GET /subscribers/{uid}/catchers/', () => {
        //Setup
        beforeEach((done) => {
            subscribers.add({
                'firstName': 'test',
                'lastName': 'test',
                'email': 'subscriber@test.com',
                'phone': '07777777777',
                'uid': 'usr_' + uid(),
                'address': 'test',
                'city': 'test',
                'county': 'test',
                'postcode': 'WA37HX',
                'type': 'S'
            }, 'S').then(() => {
                catchers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'catcher@test.com',
                    'phone': '07777777778',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'C'
                }, 'C').then(() => done());
            });
        });
        
        //Cleanup
        afterEach((done) => {
            catchers.getByEmail('catcher@test.com')
                .then((catcher) => {
                    catchers.deleteByUserId(catcher.id)
                        .then(() => {
                            subscribers.getByEmail('subscriber@test.com')
                            .then((subscriber) => {
                                subscribers.deleteByUserId(subscriber.id).then(() => done());
                            });
                        });
                });
        });

        describe('happy path', () => {
            it('should retrieve catcher allocation of subscriber', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher@test.com')
                            .then((catcher) => {
                                subscribers.allocateCatcher(catcher.id,subscriber.id)
                                    .then(() => {
                                        
                                        subscribers.getByEmail('subscriber@test.com')
                                            .then((subscriber) => {
                                                request(server)
                                                    .get('/api/v1/subscribers/' + subscriber.uid + '/catchers')
                                                    .set('Accept', 'application/json')
                                                    .expect('Content-Type', /json/)
                                                    .expect(200)
                                                    .end((err, res) => {
                                                        should.not.exist(err);
                                                        res.body[0].firstName.should.eql('test');
                                                        res.body[0].lastName.should.eql('test');
                                                        res.body[0].email.should.eql('catcher@test.com');
                                                        res.body[0].phone.should.eql('07777777778');
                                                        res.body[0].address.should.eql('test');
                                                        res.body[0].city.should.eql('test');
                                                        res.body[0].county.should.eql('test');
                                                        res.body[0].postcode.should.eql('WA37HX');
                                                        done();
                                                    });
                                            });
                                    });
                            });
                    });

                
            });
        });

        describe('error paths', () => {
            it('should throw ResourceNotFound error when catcher allocation of subscriber is not found', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        request(server)
                            .get('/api/v1/subscribers/' + subscriber.uid + '/catchers')
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(404)
                            .end((err, res) => {
                                should.not.exist(err);
                                res.body.message.should.eql('No catcher is allocated to the subscriber!');
                                done();
                            });
                    });
            });
        });
    });

    describe('POST /subscribers/{uid}/catchers/{catcherRef}', () => {
        //Setup
        beforeEach((done) => {
            subscribers.add({
                'firstName': 'test',
                'lastName': 'test',
                'email': 'subscriber@test.com',
                'phone': '07777777777',
                'uid': 'usr_' + uid(),
                'address': 'test',
                'city': 'test',
                'county': 'test',
                'postcode': 'WA37HX',
                'type': 'S'
            }, 'S').then(() => {
                catchers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'catcher@test.com',
                    'phone': '07777777778',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'C'
                }, 'C').then(() => done());
            });
        });
        
        //Cleanup
        afterEach((done) => {
            catchers.getByEmail('catcher@test.com')
                .then((catcher) => {
                    catchers.deleteByUserId(catcher.id)
                        .then(() => {
                            subscribers.getByEmail('subscriber@test.com')
                            .then((subscriber) => {
                                subscribers.deleteByUserId(subscriber.id).then(() => done());
                            });
                        });
                });
        });

        describe('happy path', () => {
            it('should allocate catcher to subscriber', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher@test.com')
                            .then((catcher) => {

                                request(server)
                                    .post('/api/v1/subscribers/' + subscriber.uid + '/catchers/' + catcher.catcher_id)
                                    .set('Content-Type', 'application/json')
                                    .set('Accept', 'application/json')
                                    .expect('Content-Type', /json/)
                                    .expect(201)
                                    .end((err, res) => {
                                        should.not.exist(err);
                                        res.body.message.should.eql('Subscriber test test is allocated to catcher test test');
                                        done();
                                    });
                            });
                    });
            });
        });

        describe('error paths', () => {
            it('should throw ResourceNotFound error when catcher ref is invalid', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher@test.com')
                            .then((catcher) => {

                                request(server)
                                    .post('/api/v1/subscribers/' + subscriber.uid + '/catchers/C001')
                                    .set('Content-Type', 'application/json')
                                    .set('Accept', 'application/json')
                                    .expect('Content-Type', /json/)
                                    .expect(404)
                                    .end((err, res) => {
                                        should.not.exist(err);
                                        res.body.should.eql({ code: 'ResourceNotFound', message: 'Catcher with ref C001 is not found!' });
                                        done();
                                    });
                            });
                    });
            });

            it('should throw ResourceNotFound error when subscriber uid is invalid', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher@test.com')
                            .then((catcher) => {

                                request(server)
                                    .post('/api/v1/subscribers/usr_sQe2/catchers/' + catcher.catcher_id)
                                    .set('Content-Type', 'application/json')
                                    .set('Accept', 'application/json')
                                    .expect('Content-Type', /json/)
                                    .expect(404)
                                    .end((err, res) => {
                                        should.not.exist(err);
                                        res.body.should.eql({ code: 'ResourceNotFound', message: 'Subscriber with uid usr_sQe2 is not found!' });
                                        done();
                                    });
                            });
                    });
            });

            it('should throw Conflict error if catcher is already allocated to subscriber', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher@test.com')
                            .then((catcher) => {
                                
                                subscribers.allocateCatcher(catcher.id,subscriber.id)
                                    .then(() => {
                                        request(server)
                                            .post('/api/v1/subscribers/' + subscriber.uid + '/catchers/' + catcher.catcher_id)
                                            .set('Content-Type', 'application/json')
                                            .set('Accept', 'application/json')
                                            .expect('Content-Type', /json/)
                                            .expect(409)
                                            .end((err, res) => {
                                                should.not.exist(err);
                                                res.body.message.should.eql('Catcher is already allocated to subscriber!');
                                                done();
                                            });
                                });
                            });
                    });
            });
        });
    });

    describe('PUT /subscribers/{uid}/catchers/{catcherRef}', () => {
        //Setup
        beforeEach((done) => {
            subscribers.add({
                'firstName': 'test',
                'lastName': 'test',
                'email': 'subscriber@test.com',
                'phone': '07777777777',
                'uid': 'usr_' + uid(),
                'address': 'test',
                'city': 'test',
                'county': 'test',
                'postcode': 'WA37HX',
                'type': 'S'
            }, 'S').then(() => {
                catchers.add({
                    'firstName': 'test',
                    'lastName': 'test',
                    'email': 'catcher1@test.com',
                    'phone': '07777777778',
                    'uid': 'usr_' + uid(),
                    'address': 'test',
                    'city': 'test',
                    'county': 'test',
                    'postcode': 'WA37HX',
                    'type': 'C'
                }, 'C').then(() => {
                    catchers.add({
                        'firstName': 'test',
                        'lastName': 'test',
                        'email': 'catcher2@test.com',
                        'phone': '07777777779',
                        'uid': 'usr_' + uid(),
                        'address': 'test',
                        'city': 'test',
                        'county': 'test',
                        'postcode': 'WA37HX',
                        'type': 'C'
                    }, 'C').then(() => {
                        subscribers.getByEmail('subscriber@test.com')
                            .then((subscriber) => {
                                catchers.getByEmail('catcher1@test.com')
                                    .then((catcher) => {
                                        subscribers.allocateCatcher(catcher.id,subscriber.id)
                                            .then(() => done());
                                    });
                            });
                    });
                });
            });
        });
        
        //Cleanup
        afterEach((done) => {
            catchers.getByEmail('catcher1@test.com')
                .then((catcher) => {
                    catchers.deleteByUserId(catcher.id)
                        .then(() => {
                            catchers.getByEmail('catcher2@test.com')
                                .then((catcher) => {
                                    catchers.deleteByUserId(catcher.id)
                                        .then(() => {
                                            subscribers.getByEmail('subscriber@test.com')
                                            .then((subscriber) => {
                                                subscribers.deleteByUserId(subscriber.id).then(() => done());
                                            });
                                        });
                                    });
                            });

                });
        });

        describe('happy path', () => {
            it('should update allocation of catcher for subscriber', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher2@test.com')
                            .then((catcher) => {

                                request(server)
                                    .put('/api/v1/subscribers/' + subscriber.uid + '/catchers/' + catcher.catcher_id)
                                    .set('Content-Type', 'application/json')
                                    .set('Accept', 'application/json')
                                    .expect('Content-Type', /json/)
                                    .expect(200)
                                    .end((err, res) => {
                                        should.not.exist(err);
                                        res.body.message.should.eql('Subscriber test test is now allocated to catcher test test');
                                        done();
                                    });
                            });
                    });
            });
        });

        describe('error paths', () => {
            it('should throw ResourceNotFound error when catcher ref is invalid', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher2@test.com')
                            .then((catcher) => {

                                request(server)
                                    .put('/api/v1/subscribers/' + subscriber.uid + '/catchers/C001')
                                    .set('Content-Type', 'application/json')
                                    .set('Accept', 'application/json')
                                    .expect('Content-Type', /json/)
                                    .expect(404)
                                    .end((err, res) => {
                                        should.not.exist(err);
                                        res.body.should.eql({ code: 'ResourceNotFound', message: 'Catcher with ref C001 is not found!' });
                                        done();
                                    });
                            });
                    });
            });

            it('should throw ResourceNotFound error when subscriber uid is invalid', (done) => {
                subscribers.getByEmail('subscriber@test.com')
                    .then((subscriber) => {
                        catchers.getByEmail('catcher2@test.com')
                            .then((catcher) => {

                                request(server)
                                    .put('/api/v1/subscribers/usr_sQe2/catchers/' + catcher.catcher_id)
                                    .set('Content-Type', 'application/json')
                                    .set('Accept', 'application/json')
                                    .expect('Content-Type', /json/)
                                    .expect(404)
                                    .end((err, res) => {
                                        should.not.exist(err);
                                        res.body.should.eql({ code: 'ResourceNotFound', message: 'Subscriber with uid usr_sQe2 is not found!' });
                                        done();
                                    });
                            });
                    });
            });
        });
    });
});