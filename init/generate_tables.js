require("dotenv").config()
const { Client, Pool } = require("pg")
const argon2 = require("argon2")

try {
  ;(async function () {
    const pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
    })

    const trunc_err = await (async () => {
      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        await client.query(
          `create table users (
            login character varying(15) primary key,
            password character varying(150) not null
          )`
        )

        await client.query(
          "insert into users(login, password) values($1, $2)",
          ["admin", await argon2.hash(process.env.ADMIN_PASSWORD)]
        )

        await client.query(
          `create table products (
            product_id serial primary key,
            p_type CHARACTER VARYING(20) not null,
            price integer not null,
            name CHARACTER VARYING(20) not null,
            specif jsonb,
            CHECK (price >= 0)
          )`
        )

        await client.query("COMMIT")
      } catch (e) {
        await client.query("ROLLBACK")
        throw e
      } finally {
        client.release()
      }
    })().catch((e) => e)

    if (trunc_err) {
      throw trunc_err
    }

    pool.end()

    console.log("Таблицы сгенерированы")
  })()
} catch (err) {
  console.error(err)
}
