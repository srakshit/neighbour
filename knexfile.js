// Update with your config settings.

module.exports = {

  local : {
    client: 'sqlite3',
    connection: { filename: ':memory'},
    useNullAsDefault: true,
    migrations: {
        directory: __dirname + '/db/migrations'
    }
  },

  dev: {
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
      database: 'catchernet',
      user:     'catchernet',
      password: 'catchernet2018'
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

  prod: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      database: 'catchernet',
      user:     'catchernet',
      password: 'catchernet2018'
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
