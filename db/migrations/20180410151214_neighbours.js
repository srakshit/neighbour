'use strict';

exports.up = (knex) => {
    return knex.schema.createTable('neighbours', (table) => {
        table.increments();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('phone').notNullable().unique();
        table.string('address').notNullable();
        table.string('postcode').notNullable();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTable('neighbours');
};
