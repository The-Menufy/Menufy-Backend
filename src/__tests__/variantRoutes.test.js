/* src/__tests__/variantRoutes.test.js */

/* ---------------- deps --------------------------------- */
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/* ---------------- model -------------------------------- */
const Variant = require('../models/recipeVariant');

/* ---------------- mocks (avant router !) --------------- */
jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, _res, cb) => {
      req.file = {
        filename: 'test-image.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      };
      cb(null, true); // Simulate successful file upload
    }),
  }));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

/* ---------------- router ------------------------------- */
const variantRouter = require('../modules/MenuMangment/recipeVariantRoutes'); // Adjust path if needed

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
describe('Recipe-Variant Routes', () => {
  /* -------- POST -------------------------------------- */
  describe('POST /', () => {
    it('creates a variant', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          name: 'Veggie',
          portions: 'half-portion,medium-portion',
          modifiedIngredientsGroup: JSON.stringify([]),
          modifiedSteps: JSON.stringify([]),
          note: 'Vegan version',
        })
        .expect(201);

      expect(body).toMatchObject({
        name: 'Veggie',
        portions: ['half-portion', 'medium-portion'],
        note: 'Vegan version',
        images: ['/uploads/test-image.jpg'],
      });
    });

    it('400 if name missing', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          portions: 'half-portion',
          modifiedIngredientsGroup: JSON.stringify([]),
          modifiedSteps: JSON.stringify([]),
        })
        .expect(400);

      expect(body).toHaveProperty('error', 'Name and portions are required');
    });

    it('400 if portions missing', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          name: 'Veggie',
          modifiedIngredientsGroup: JSON.stringify([]),
          modifiedSteps: JSON.stringify([]),
        })
        .expect(400);

      expect(body).toHaveProperty('error', 'Name and portions are required');
    });

    it('400 if invalid portion type', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          name: 'Veggie',
          portions: 'invalid-portion',
          modifiedIngredientsGroup: JSON.stringify([]),
          modifiedSteps: JSON.stringify([]),
        })
        .expect(400);

      expect(body.error).toMatch(/Invalid portion types/);
    });
  });

  /* -------- GET list ---------------------------------- */
  describe('GET list', () => {
    beforeEach(async () => {
      await Variant.create({ 
        name: 'Orig', 
        portions: ['half-portion'], 
        images: [] 
      });
    });

    it('GET / returns all', async () => {
      const { body } = await request(app).get('/').expect(200);
      expect(body.length).toBe(1);
      expect(body[0]).toMatchObject({
        name: 'Orig',
        portions: ['half-portion'],
      });
    });
  });

  /* -------- PUT /:id ---------------------------------- */
  describe('PUT /:id', () => {
    let id;
    beforeEach(async () => {
      const variant = await Variant.create({
        name: 'Base',
        portions: ['half-portion'],
        images: ['/uploads/old.jpg'],
      });
      id = variant._id.toString();
    });

    it('updates variant and replaces image', async () => {
      const { body } = await request(app)
        .put(`/${id}`)
        .send({
          name: 'Updated',
          portions: 'medium-portion,double-portion',
          modifiedIngredientsGroup: JSON.stringify([]),
          modifiedSteps: JSON.stringify([]),
        })
        .expect(200);

      expect(body).toMatchObject({
        name: 'Updated',
        portions: ['medium-portion', 'double-portion'],
        images: ['/uploads/test-image.jpg'],
      });
    });

    it('404 when not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { body } = await request(app)
        .put(`/${fakeId}`)
        .send({
          name: 'X',
          portions: 'half-portion',
          modifiedIngredientsGroup: JSON.stringify([]),
          modifiedSteps: JSON.stringify([]),
        })
        .expect(404);
      expect(body).toEqual({ error: 'Variant not found' });
    });
  });

  /* -------- DELETE /:id ------------------------------- */
  describe('DELETE /:id', () => {
    let id;
    beforeEach(async () => {
      const variant = await Variant.create({ 
        name: 'Del', 
        portions: ['half-portion'] 
      });
      id = variant._id.toString();
    });

    it('deletes variant', async () => {
      const { body } = await request(app).delete(`/${id}`).expect(200);
      expect(body).toEqual({ message: 'Variant deleted successfully' });
      expect(await Variant.findById(id)).toBeNull();
    });

    it('404 when not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { body } = await request(app).delete(`/${fakeId}`).expect(404);
      expect(body).toEqual({ error: 'Variant not found' });
    });
  });

  /* -------- PUT /:id/archive -------------------------- */
  describe('PUT /:id/archive', () => {
    let id;
    beforeEach(async () => {
      const variant = await Variant.create({ 
        name: 'ArchiveTest', 
        portions: ['half-portion'], 
        isArchived: false 
      });
      id = variant._id.toString();
    });

    it('archives variant', async () => {
      const { body } = await request(app).put(`/${id}/archive`).expect(200);
      expect(body).toMatchObject({
        name: 'ArchiveTest',
        isArchived: true,
      });
    });

    it('404 when not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { body } = await request(app).put(`/${fakeId}/archive`).expect(404);
      expect(body).toEqual({ error: 'Variant not found' });
    });
  });

  /* -------- PUT /:id/restore -------------------------- */
  describe('PUT /:id/restore', () => {
    let id;
    beforeEach(async () => {
      const variant = await Variant.create({ 
        name: 'RestoreTest', 
        portions: ['half-portion'],
      });
      id = variant._id.toString();
      await Variant.findByIdAndUpdate(id, { isArchived: true });
    });

    it('restores variant', async () => {
      const { body } = await request(app).put(`/${id}/restore`).expect(200);
      expect(body).toMatchObject({
        name: 'RestoreTest',
        isArchived: false,
      });
    });

    it('404 when not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { body } = await request(app).put(`/${fakeId}/restore`).expect(404);
      expect(body).toEqual({ error: 'Variant not found' });
    });
  });
});