/*  src/__tests__/categoryRoutes.test.js  */

const request  = require('supertest');
const express  = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Menu      = require('../models/Menu');
const Category  = require('../models/Category');
const catRouter = require('../modules/MenuMangment/category.routes'); // ← adjust if folder differs

/* ------------------------------------------------------------------ */
/* 1. SAFE fs MOCK                                                    */
/* ------------------------------------------------------------------ */
jest.mock('fs', () => {
  const realFs = jest.requireActual('fs');

  return {
    ...realFs,
    mkdirSync : jest.fn(),
    unlinkSync: jest.fn(),
    existsSync: jest.fn(() => true), // always pretend the file exists
  };
});
const fs = require('fs'); // after the mock

/* ------------------------------------------------------------------ */
/* 2. MULTER MOCK (always “uploads” test‑image.jpg)                   */
/* ------------------------------------------------------------------ */
jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = {
        filename    : 'test-image.jpg',
        originalname: 'test-image.jpg',
        mimetype    : 'image/jpeg',
      };
      next();
    }),
  }));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

/* ------------------------------------------------------------------ */
/* 3. EXPRESS APP                                                     */
/* ------------------------------------------------------------------ */
const app = express();
app.use(express.json());
app.use('/', catRouter);

/* ------------------------------------------------------------------ */
/* 4. IN‑MEMORY MONGODB                                               */
/* ------------------------------------------------------------------ */
let mongo;
let menuId;           // used by several tests

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: 'jest' });

  // create one menu so Category.menu points to a valid id
  const { _id } = await Menu.create({ name: 'Main Menu', visibility: 'public', rate: 10 });
  menuId = _id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await Category.deleteMany({});
  jest.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/* 5. TESTS                                                           */
/* ------------------------------------------------------------------ */
describe('Category routes', () => {
  /* ------------- POST /upload ------------------------------------ */
  describe('POST /upload', () => {
    it('creates a new category', async () => {
      const { body } = await request(app)
        .post('/upload')
        .send({
          libelle   : 'Cat A',
          description: 'Tasty starters',
          visibility: 'visible',
          menu      : menuId,
        })
        .expect(200);

      expect(body).toMatchObject({
        libelle   : 'Cat A',
        description: 'Tasty starters',
        visibility: 'visible',
        menu      : menuId,
        photo     : '/Uploads/category/test-image.jpg',
      });
    });

    it('400 on missing required fields', async () => {
      const { body } = await request(app)
        .post('/upload')
        .send({ libelle: 'X', menu: menuId })
        .expect(400);

      expect(body).toEqual({ error: 'Libelle, visibility, and menu are required fields' });
    });
  });

  /* ------------- PUT /upload/:id --------------------------------- */
  describe('PUT /upload/:id', () => {
    let catId;
    beforeEach(async () => {
      const { _id } = await Category.create({
        libelle   : 'Orig',
        description: 'Old',
        visibility: 'visible',
        menu      : menuId,
        photo     : '/Uploads/category/old-image.jpg',
      });
      catId = _id.toString();
    });

    it('updates a category and removes old photo', async () => {
        const { body } = await request(app)
          .put(`/upload/${catId}`)
          .send({
            libelle    : 'Updated',
            description: 'New desc',
            visibility : 'visible',
            menu       : menuId,
          })
          .expect(200);
      
        expect(body).toMatchObject({
          libelle    : 'Updated',
          description: 'New desc',
          visibility : 'visible',
          photo      : '/Uploads/category/test-image.jpg',
          menu       : { _id: menuId },   // le champ menu est un objet peuplé
        });
      
        expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('old-image.jpg'));
      });
      

    it('404 when category not found', async () => {
      const { body } = await request(app)
        .put('/upload/64b3ad4257fe3f896b6ddead')
        .send({
          libelle   : 'Any',
          visibility: 'visible',
          menu      : menuId,
        })
        .expect(404);

      expect(body).toEqual({ error: 'Category not found' });
    });
  });

  /* ------------- GET / and /:id ---------------------------------- */
  describe('GET operations', () => {
    let cat;
    beforeEach(async () => {
      cat = await Category.create({
        libelle   : 'Listed',
        visibility: 'visible',
        menu      : menuId,
      });
    });

    it('GET / returns all categories', async () => {
      const { body } = await request(app).get('/').expect(200);
      expect(body.length).toBe(1);
      expect(body[0].libelle).toBe('Listed');
    });

    it('GET /:id returns a single category', async () => {
      const { body } = await request(app).get(`/${cat._id}`).expect(200);
      expect(body.libelle).toBe('Listed');
    });

    it('GET /:id 404 when not found', async () => {
      const { body } = await request(app).get('/64b3ad4257fe3f896b6ddead').expect(404);
      expect(body).toEqual({ error: 'Category not found' });
    });

    it('GET /menu/:menuId returns categories for that menu', async () => {
      const { body } = await request(app).get(`/menu/${menuId}`).expect(200);
      expect(body.length).toBe(1);
      expect(body[0]._id).toBe(cat._id.toString());
    });
  });

  /* ------------- DELETE /:id ------------------------------------- */
  describe('DELETE /:id', () => {
    let delId;
    beforeEach(async () => {
      const { _id } = await Category.create({
        libelle   : 'Del',
        visibility: 'visible',
        menu      : menuId,
        photo     : '/Uploads/category/test-image.jpg',
      });
      delId = _id.toString();
    });

    it('deletes a category and its photo', async () => {
      const { body } = await request(app).delete(`/${delId}`).expect(200);
      expect(body).toEqual({ message: 'Category and related products deleted successfully' }); // Updated message
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('test-image.jpg'));
      expect(await Category.findById(delId)).toBeNull();
    });

    it('404 when not found', async () => {
      const { body } = await request(app).delete('/64b3ad4257fe3f896b6ddead').expect(404);
      expect(body).toEqual({ error: 'Category not found' });
    });
  });

  /* ------------- ARCHIVE / RESTORE ------------------------------- */
  describe('Archive & restore', () => {
    let catId;
    beforeEach(async () => {
      const { _id } = await Category.create({
        libelle   : 'Arc',
        visibility: 'visible',
        menu      : menuId,
      });
      catId = _id.toString();
    });

    it('archives a category', async () => {
      const { body } = await request(app).put(`/${catId}/archive`).expect(200);
      expect(body).toMatchObject({ message: 'Category archived successfully', category: { visibility: 'archived' } });
    });
    it('400 if already archived', async () => {
        await Category.findByIdAndUpdate(catId, { visibility: 'archived' });
      
        const { body } = await request(app)
          .put(`/${catId}/archive`)
          .expect(400);
      
        expect(body).toEqual({ error: 'Category is already archived' });
      });
      
    it('restores a category', async () => {
      await Category.findByIdAndUpdate(catId, { visibility: 'archived' });

      const { body } = await request(app).put(`/${catId}/restore`).expect(200);
      expect(body).toMatchObject({ message: 'Category restored successfully', category: { visibility: 'visible' } });
    });

    it('400 if not archived', async () => {
      const { body } = await request(app).put(`/${catId}/restore`).expect(400);
      expect(body).toEqual({ error: 'Category is not archived' });
    });
  });
});
