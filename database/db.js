import postgres from 'postgres';
const sql =
  process.env.NODE_ENV === 'production'
    ? // "Unless you're using a Private or Shield Heroku Postgres database, Heroku Postgres does not currently support verifiable certificates"
      // https://help.heroku.com/3DELT3RK/why-can-t-my-third-party-utility-connect-to-heroku-postgres-with-ssl
      postgres(process.env.DATABASE_URL,{ ssl: { rejectUnauthorized: false } })
    : postgres('postgres://localhost:5432/firststore')
export default sql ;
