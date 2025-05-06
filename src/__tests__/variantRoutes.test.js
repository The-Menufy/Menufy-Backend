/*  src/__tests__/variantRoutes.test.js  */

/* ---------------- deps --------------------------------- */
const request  = require('supertest');
const express  = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/* ---------------- model -------------------------------- */
const Variant = require('../models/recipeVariant');

/* ---------------- mocks (avant router !) --------------- */
jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, _res, cb) => {
      req.file = {
        filename    : 'test-image.jpg',
        originalname: 'test.jpg',
        mimetype    : 'image/jpeg',
      };
      cb(null);
    }),
  }));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

/* ---------------- router ------------------------------- */
const variantRouter = require('../modules/MenuMangment/recipeVariantRoutes'); // adapte le chemin si besoin

/* ---------------- app & mongo -------------------------- */
const app = express();
app.use(express.json());
app.use('/', variantRouter);

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
  await Variant.deleteMany({});
});

/* ================== TESTS ============================== */
describe('Recipe‑Variant Routes', () => {
  /* -------- POST -------------------------------------- */
  describe('POST /', () => {
    it('creates a variant', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          name                     : 'Veggie',
          modifiedIngredientsGroup : JSON.stringify([]),
          modifiedSteps            : JSON.stringify([]),
          note                     : 'Vegan version',
        })
        .expect(201);

      expect(body).toMatchObject({
        name  : 'Veggie',
        note  : 'Vegan version',
        images: ['/uploads/test-image.jpg'],
      });
    });

    it('400 if name missing', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          modifiedIngredientsGroup : '[]',
          modifiedSteps            : '[]',
        })
        .expect(400);

      expect(body).toHaveProperty('error');
    });
  });

  /* -------- GET list ---------------------------------- */
  describe('GET list', () => {
    beforeEach(async () => {
      await Variant.create({ name: 'Orig', portions: [] });
    });

    it('GET / returns all', async () => {
      const { body } = await request(app).get('/').expect(200);
      expect(body.length).toBe(1);
      expect(body[0].name).toBe('Orig');
    });
  });

  /* -------- PUT /:id ---------------------------------- */
  describe('PUT /:id', () => {
    let id;
    beforeEach(async () => {
      id = (await Variant.create({
        name    : 'Base',
        portions: [],
        images  : ['/uploads/old.jpg'],
      }))._id.toString();
    });

    it('updates variant and replaces image', async () => {
      const { body } = await request(app)
        .put(`/${id}`)
        .send({
          name                     : 'Updated',
          modifiedIngredientsGroup : JSON.stringify([]),
          modifiedSteps            : JSON.stringify([]),
        })
        .expect(200);

      expect(body.name).toBe('Updated');
      expect(body.images).toEqual(['/uploads/test-image.jpg']);
    });

    it('404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app)
        .put(`/${fake}`)
        .send({
          name                     : 'X',
          modifiedIngredientsGroup : '[]',
          modifiedSteps            : '[]',
        })
        .expect(404);
      expect(body).toEqual({ error: 'Variant not found' });
    });
  });

  /* -------- DELETE /:id ------------------------------- */
  describe('DELETE /:id', () => {
    let id;
    beforeEach(async () => {
      id = (await Variant.create({ name: 'Del', portions: [] }))._id.toString();
    });

    it('deletes variant', async () => {
      const { body } = await request(app).delete(`/${id}`).expect(200);
      expect(body).toEqual({ message: 'Variant deleted successfully' });
      expect(await Variant.findById(id)).toBeNull();
    });

    it('404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app).delete(`/${fake}`).expect(404);
      expect(body).toEqual({ error: 'Variant not found' });
    });
  });
});
