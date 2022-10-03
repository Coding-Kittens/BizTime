const express = require("express");
const db = require("../db");
const router = new express.Router();
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code,name FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const result = await db.query(
      `SELECT * FROM companies LEFT JOIN invoices ON code=invoices.comp_code WHERE code=$1`,
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of ${code} not found!`, 404);
    }

    return res.json({
      company: {
        code: result.rows[0].code,
        name: result.rows[0].name,
        description: result.rows[0].description,
        invoices: result.rows.map((r) => r.id),
      },
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code,name,description) Values($1,$2,$3) RETURNING *`,
      [code, name, description]
    );
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$2,description=$3  WHERE code=$1 RETURNING *`,
      [code, name, description]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of ${code} not found!`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies WHERE code=$1 RETURNING code`,
      [code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of ${code} not found!`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
