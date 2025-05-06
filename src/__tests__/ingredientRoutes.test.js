/*  src/__tests__/ingredientRoutes.test.js  */

/* ---------------- dépendances --------------------------- */
const request  = require('supertest');
const express  = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/* ---------------- modèles ------------------------------- */
const Ingredient = require('../models/Ingredieent');

/* ---------------- mocks (avant le router !) ------------- */
jest.mock('fs', () => {
  const real = jest.requireActual('fs');
  return {
    ...real,
    existsSync: jest.fn(() => true),
    mkdirSync : jest.fn(),
    unlinkSync: jest.fn(),
  };
});
const fs = require('fs');

jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, _res, cb) => {
      req.file = {
        filename    : 'test-image.jpg',
        originalname: 'test-image.jpg',
        mimetype    : 'image/jpeg',
      };
      cb(null);
    }),
  }));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

/* ---------------- router (après mocks) ------------------ */
const ingredientRouter = require('../modules/MenuMangment/ingredient.routes'); // ← ajuster si dossier différent

/* ---------------- app & mongo mémoire ------------------- */
const app = express();
app.use(express.json());
app.use('/', ingredientRouter);

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
  await Ingredient.deleteMany({});
  jest.clearAllMocks();
});

/* ================== TESTS =============================== */
describe('Ingredient Routes', () => {
  /* POST ----------------------------------------------- */
  describe('POST /', () => {
    it('creates an ingredient', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          libelle      : 'Tomate',
          quantity     : '100',
          type         : 'legume',
          price        : '2.5',
          disponibility: 'true',
          qtMax        : '500',
        })
        .expect(201);

      expect(body).toMatchObject({
        libelle      : 'Tomate',
        quantity     : 100,
        type         : 'legume',
        price        : 2.5,
        disponibility: true,
        qtMax        : 500,
        archived     : false,
        photo        : '/Uploads/ingredients/test-image.jpg',
      });
    });
  });

  /* READS ---------------------------------------------- */
  describe('Reads', () => {
    let ingId;
    beforeEach(async () => {
      ingId = (await Ingredient.create({
        libelle      : 'Oignon',
        quantity     : 50,
        type         : 'legume',
        price        : 1,
        disponibility: true,
        qtMax        : 300,
      }))._id.toString();
    });

    it('GET / returns all', async () => {
      const { body } = await request(app).get('/').expect(200);
      expect(body.length).toBe(1);
      expect(body[0]._id).toBe(ingId);
    });

    it('GET /:id returns one', async () => {
      const { body } = await request(app).get(`/${ingId}`).expect(200);
      expect(body._id).toBe(ingId);
    });

    it('GET /:id 404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app).get(`/${fake}`).expect(404);
      expect(body).toEqual({ error: 'Ingredient not found' });
    });
  });

  /* PUT ----------------------------------------------- */
  describe('PUT /:id', () => {
    let ingId;
    beforeEach(async () => {
      ingId = (await Ingredient.create({
        libelle      : 'Carotte',
        quantity     : 70,
        type         : 'legume',
        price        : 1.2,
        disponibility: true,
        qtMax        : 400,
        photo        : '/Uploads/ingredients/old.jpg',
      }))._id.toString();
    });

    it('updates ingredient & removes old photo', async () => {
      const { body } = await request(app)
        .put(`/${ingId}`)
        .send({
          libelle      : 'Carotte bio',
          quantity     : '80',
          type         : 'legume',
          price        : '1.4',
          disponibility: 'false',
          qtMax        : '500',
          archived     : 'true',
        })
        .expect(200);

      expect(body).toMatchObject({
        libelle      : 'Carotte bio',
        quantity     : 80,
        price        : 1.4,
        disponibility: false,
        qtMax        : 500,
        archived     : true,
        photo        : '/Uploads/ingredients/test-image.jpg',
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('old.jpg'));
    });

    it('404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app)
        .put(`/${fake}`)
        .send({                                 // ✅ tous les champs valides
                  libelle      : 'X',
                  quantity     : '1',
                  type         : 'legume',
                price        : '0.5',
                 disponibility: 'true',
                  qtMax        : '10',
               })
        .expect(404);
      expect(body).toEqual({ error: 'Ingredient not found' });
    });
  });

  /* DELETE --------------------------------------------- */
  describe('DELETE /:id', () => {
    let ingId;
    beforeEach(async () => {
      ingId = (await Ingredient.create({
        libelle      : 'Persil',
        quantity     : 20,
        type         : 'herbe',
        price        : 0.5,
        disponibility: true,
        qtMax        : 100,
        photo        : '/Uploads/ingredients/test-image.jpg',
      }))._id.toString();
    });

    it('deletes ingredient & photo', async () => {
      const { body } = await request(app).delete(`/${ingId}`).expect(200);
      expect(body).toEqual({ message: 'Ingredient deleted successfully' });
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('test-image.jpg'));
      expect(await Ingredient.findById(ingId)).toBeNull();
    });

    it('404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app).delete(`/${fake}`).expect(404);
      expect(body).toEqual({ error: 'Ingredient not found' });
    });
  });

  /* ARCHIVE / RESTORE ---------------------------------- */
  describe('Archive / restore', () => {
    let ingId;
    beforeEach(async () => {
      ingId = (await Ingredient.create({
        libelle      : 'Basilic',
        quantity     : 10,
        type         : 'herbe',
        price        : 1,
        disponibility: true,
        qtMax        : 50,
      }))._id.toString();
    });

    it('archives an ingredient', async () => {
      const { body } = await request(app).put(`/${ingId}/archive`).expect(200);
      expect(body.ingredient.archived).toBe(true);
    });

    it('400 if already archived', async () => {
      await Ingredient.findByIdAndUpdate(ingId, { archived: true });
      const { body } = await request(app).put(`/${ingId}/archive`).expect(400);
      expect(body).toEqual({ error: 'Ingredient is already archived' });
    });

    it('restores an ingredient', async () => {
      await Ingredient.findByIdAndUpdate(ingId, { archived: true });
      const { body } = await request(app).put(`/${ingId}/restore`).expect(200);
      expect(body.ingredient.archived).toBe(false);
    });

    it('400 if not archived', async () => {
      const { body } = await request(app).put(`/${ingId}/restore`).expect(400);
      expect(body).toEqual({ error: 'Ingredient is not archived' });
    });
  });
});
