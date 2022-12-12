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
            password character varying(150) not null,
            name character varying(40) not null
          )`
        )

        await client.query(
          "insert into users(login, password, name) values($1, $2, $3)",
          ["admin", await argon2.hash(process.env.ADMIN_PASSWORD), "admin"]
        )

        await client.query(
          `create table type_products (
            p_type_id serial primary key,
            name CHARACTER VARYING(20) not null
          )`
        )

        await client.query(
          `create table brands (
            brand_id serial primary key,
            name CHARACTER VARYING(20) not null
          )`
        )

        await client.query(
          `create table products (
            product_id serial primary key,
            p_type_id integer not null,
            price integer not null,
            name CHARACTER VARYING(20) not null,
            specif jsonb,
            brand_id integer,
            CHECK (price >= 0),
            FOREIGN KEY (p_type_id) REFERENCES type_products (p_type_id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (brand_id) REFERENCES brands (brand_id) ON UPDATE CASCADE ON DELETE CASCADE
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
