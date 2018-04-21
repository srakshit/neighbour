
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('firstName').notNullable();
            table.string('lastName').notNullable();
            table.string('email').notNullable().unique();
            table.string('phone').notNullable().unique();
            table.string('address').notNullable();
            table.string('postcode').notNullable();
            table.string('type').notNullable();
        }),
        
        knex.schema.createTable('catchers', (table) => {
            table.integer('user_id').unsigned().references('id').inTable('users');
            table.string('catcher_id').notNullable().unique();
            table.boolean('isActive').notNullable().defaultTo(true);
        }),
        
        knex.schema.createTable('subscribers', (table) => {
            table.integer('user_id').unsigned().references('id').inTable('users');
            table.string('subscriber_id').notNullable().unique();
            table.string('stripe_customer_id');
            table.boolean('isActive').notNullable().defaultTo(true);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('catchers'),
        knex.schema.dropTable('subscribers'),
        knex.schema.dropTable('users')
    ]);
};
