// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      database: 'catchernet',
      user:     'postgres',
      password: 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/development'
    }
  },

  staging: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/staging'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + '/db/migrations'
    }
  }
};
