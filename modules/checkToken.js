const jwt = require("jsonwebtoken")
const { Pool } = require("pg")
require('dotenv').config()

module.exports = async (token) => {
  //try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const pool = new Pool()
    const res = await pool.query(
      "select exists(SELECT * FROM users WHERE login=$1)",
      [decoded]
    )
    await pool.end()

    return res.rows[0].exists
  /*} catch (err) {
    console.log(err)
    return false
  }*/
}