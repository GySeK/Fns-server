"use strict"
require("dotenv").config()
const { Pool, Client } = require("pg")
const checkReqToken = require("../../modules/checkReqToken")
const jwt = require("jsonwebtoken")
const argon2 = require("argon2")
const getProperty = require("../../modules/getProperty")

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    try {
      return "zalupas"
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })
  fastify.get("/get/token", async function (request, reply) {
    try {
      const login = getProperty(request.query, "login")
      const password = getProperty(request.query, "password")

      const pool = new Pool()
      const res = await pool.query("select * from users where login = $1", [
        login,
      ])
      await pool.end()
      if (res.rowCount == 0) return null

      if (!(await argon2.verify(res.rows[0].password, password))) return null
      return jwt.sign({ login }, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.get("/get/token/check/fast", async function (request, reply) {
    try {
      const token = getProperty(request.query, "token")
      return jwt.verify(token, process.env.JWT_SECRET) ? true : false
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.get("/get/products", async function (request, reply) {
    try {
      const pool = new Pool()
      const res = await pool.query("select * from products", [])
      await pool.end()

      return res.rows
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.get("/get/products/p_type", async function (request, reply) {
    try {
      const p_type = getProperty(request.query, "p_type")

      const pool = new Pool()
      const res = await pool.query(
        "select * from products where p_type=$1",
        [p_type]
      )
      await pool.end()

      return res.rows
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.register(async (instance, opts, done) => {
    instance.addHook("preHandler", async (request, reply) => {
      await checkReqToken(request, reply)
    })

    //Products
    instance.post("/post/product", async (request, reply) => {
      try {
        const p_type = getProperty(request.body, "p_type")
        const price = getProperty(request.body, "price")
        const name = getProperty(request.body, "name")
        const specif = getProperty(request.body, "specif")

        const pool = new Pool()
        await pool.query(
          "insert into products(p_type, price, name, specif) values($1, $2, $3, $4)",
          [p_type, price, name, specif]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/product", async (request, reply) => {
      try {
        const product_id = getProperty(request.body, "product_id")

        const pool = new Pool()
        await pool.query("delete from products where product_id=$1", [
          product_id,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/product/name", async (request, reply) => {
      try {
        const product_id = getProperty(request.body, "product_id")
        const new_name = getProperty(request.body, "new_name")

        const pool = new Pool()
        const res = await pool.query(
          "update products set name=$1 where product_id=$2",
          [new_name, product_id]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/product/specif", async (request, reply) => {
      try {
        const product_id = getProperty(request.body, "product_id")
        const new_specif = getProperty(request.body, "new_specif")

        const pool = new Pool()
        await pool.query("update products set specif=$1 where product_id=$2", [
          new_specif,
          product_id,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/product/price", async (request, reply) => {
      try {
        const product_id = getProperty(request.body, "product_id")
        const new_price = getProperty(request.body, "new_price")

        const pool = new Pool()
        await pool.query("update products set price=$1 where product_id=$2", [
          new_price,
          product_id,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/product/p_type", async (request, reply) => {
      try {
        const product_id = getProperty(request.body, "product_id")
        const new_p_type = getProperty(request.body, "new_p_type")

        const pool = new Pool()
        await pool.query(
          "update products set p_type_id=$1 where product_id=$2",
          [new_p_type, product_id]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    done()
  })
}
