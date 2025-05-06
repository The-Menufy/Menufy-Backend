/*  src/__tests__/productRoutes.test.js  */
const request  = require('supertest');
const express  = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Product  = require('../models/Product');
const Recipe   = require('../models/Recipe');
const Category = require('../models/Category');

/* ---------- mocks fs & multer ------------------------- */
jest.mock('fs', () => {
  const real = jest.requireActual('fs');
  return {
    ...real,
    existsSync: jest.fn(() => true),
    mkdirSync : jest.fn(),
    unlinkSync: jest.fn(),
  };
});
jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, _res, next) => {
      req.file = {
        filename    : 'test-image.jpg',
        mimetype    : 'image/jpeg',
        originalname: 'test-image.jpg',
      };
      next();
    }),
  }));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

/* ---------- app & router ------------------------------ */
const productRouter = require('../modules/MenuMangment/product.routes');
const app = express();
app.use(express.json());
app.use('/', productRouter);

/* ---------- mongo‑memory ------------------------------ */
let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: 'jest' });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
afterEach(async () => {
  await Promise.all([
    Product.deleteMany({}),
    Recipe.deleteMany({}),
    Category.deleteMany({}),
  ]);
});

/* ---------- helpers ----------------------------------- */
const validTypePlat = Product.schema.path('typePlat').enumValues[0];
async function makeCategory() {
  return (await Category.create({ libelle: 'Cat' }))._id.toString();
}

/* ====================================================== */
describe('Product Routes', () => {
  /* POST ---------------------------------------------- */


  /* READS --------------------------------------------- */
  describe('Reads', () => {
    let prodId, catId;

    beforeEach(async () => {
      catId = await makeCategory();
      prodId = (
        await Product.create({
          name       : 'Prod',
          price      : 5,
          categoryFK : catId,
          typePlat   : validTypePlat,
          description: 'd',
          promotion  : '0',
          duration   : '10',
        })
      )._id.toString();
    });

    it('GET / returns all', async () => {
      const { body } = await request(app).get('/').expect(200);
      expect(body).toHaveLength(1);
    });

    it('GET /:id returns one', async () => {
      const { body } = await request(app).get(`/${prodId}`).expect(200);
      expect(body._id).toBe(prodId);
    });

    it('GET /:id 404 when not found', async () => {
      await request(app)
        .get(`/${new mongoose.Types.ObjectId()}`)
        .expect(404);
    });

    it('GET /category/:id filters', async () => {
      const { body } = await request(app)
        .get(`/category/${catId}`)
        .expect(200);
      expect(body).toHaveLength(1);
    });
  });

  /* PUT ----------------------------------------------- */


  /* DELETE -------------------------------------------- */
  describe('DELETE /:id', () => {
    let prodId;

    beforeEach(async () => {
      const catId = await makeCategory();
      prodId = (
        await Product.create({
          name       : 'Del',
          price      : 6,
          categoryFK : catId,
          typePlat   : validTypePlat,
          description: 'd',
          promotion  : '0',
          duration   : '10',
          photo      : '/Uploads/products/test-image.jpg',
        })
      )._id.toString();
    });

    it('deletes product, photo, and recipe', async () => {
      await request(app).delete(`/${prodId}`).expect(200);
      expect(await Product.findById(prodId)).toBeNull();
    });

    it('404 when not found', async () => {
      await request(app)
        .delete(`/${new mongoose.Types.ObjectId()}`)
        .expect(404);
    });
  });

  /* ARCHIVE / RESTORE --------------------------------- */
  describe('Archive / restore', () => {
    let prodId;

    beforeEach(async () => {
      const catId = await makeCategory();
      prodId = (
        await Product.create({
          name       : 'Arc',
          price      : 7,
          categoryFK : catId,
          typePlat   : validTypePlat,
          description: 'd',
          promotion  : '0',
          duration   : '10',
        })
      )._id.toString();
    });

    it('archives a product', async () => {
      const { body } = await request(app)
        .put(`/${prodId}/archive`)
        .expect(200);
      expect(body.product.archived).toBe(true);
    });

    it('400 if already archived', async () => {
      await Product.findByIdAndUpdate(prodId, { archived: true });
      await request(app).put(`/${prodId}/archive`).expect(400);
    });

    it('restores a product', async () => {
      await Product.findByIdAndUpdate(prodId, { archived: true });
      const { body } = await request(app)
        .put(`/${prodId}/restore`)
        .expect(200);
      expect(body.product.archived).toBe(false);
    });

    it('400 if not archived', async () => {
      await request(app).put(`/${prodId}/restore`).expect(400);
    });
  });
});
