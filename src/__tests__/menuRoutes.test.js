/*  src/__tests__/menu.routes.test.js  */

const request  = require('supertest');
const express  = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Menu   = require('../models/Menu');
const router = require('../modules/MenuMangment/menu.routes');

/* ------------------------------------------------------------------ */
/* PART 1 – SAFE FS MOCK (keep every real method except the few        */
/*           we need to spy on)                                        */
/* ------------------------------------------------------------------ */
jest.mock('fs', () => {
  const realFs = jest.requireActual('fs');

  return {
    ...realFs,                       // keep every real method
    mkdirSync : jest.fn(),           // stub the ones we assert against
    unlinkSync: jest.fn(),
  existsSync: jest.fn(() => true), // ← PRETEND every path exists
  };
});

const fs = require('fs');          // <- after the mock so this is the mocked version

/* ------------------------------------------------------------------ */
/* PART 2 – MULTER MOCK (pretend an image is always uploaded)          */
/* ------------------------------------------------------------------ */
jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      // pretend the client uploaded “test-image.jpg”
      req.file = {
        filename    : 'test-image.jpg',
        originalname: 'test-image.jpg',
        mimetype    : 'image/jpeg',
      };
      next();
    }),
  }));

  multer.diskStorage = jest.fn(() => ({
    destination: jest.fn((req, file, cb) => cb(null, 'Uploads/menus')),
    filename   : jest.fn((req, file, cb) => cb(null, 'test-image.jpg')),
  }));

  return multer;
});

/* ------------------------------------------------------------------ */
/* PART 3 – EXPRESS APP                                               */
/* ------------------------------------------------------------------ */
const app = express();
app.use(express.json());
app.use('/', router);

/* ------------------------------------------------------------------ */
/* PART 4 – IN‑MEMORY MONGODB                                         */
/* ------------------------------------------------------------------ */
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'jest' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Menu.deleteMany({});
  jest.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/* PART 5 – TESTS                                                     */
/* ------------------------------------------------------------------ */
describe('Menu routes', () => {
  /* ----------------------- POST / --------------------------------- */
  describe('POST /', () => {
    it('creates a new menu item', async () => {
      const { body } = await request(app)
        .post('/')
        .send({ name: 'Menu A', visibility: 'public', rate: '10' })
        .expect(201);

      expect(body).toMatchObject({
        name      : 'Menu A',
        visibility: 'public',
        rate      : '10',
        archived  : false,
        photo     : '/Uploads/menus/test-image.jpg',
      });
    });

    it('returns 400 when required fields are missing', async () => {
      const { body } = await request(app)
        .post('/')
        .send({ visibility: 'public' })
        .expect(400);

      expect(body).toEqual({ error: 'Name, visibility, and rate are required' });
    });
  });

  /* ----------------------- PUT /:id ------------------------------- */
  describe('PUT /:id', () => {
    let menuId;
    beforeEach(async () => {
      const { _id } = await Menu.create({
        name      : 'Original',
        visibility: 'public',
        rate      : '10',
        photo     : '/Uploads/menus/old-image.jpg',
      });
      menuId = _id.toString();
    });

    it('updates a menu item', async () => {
      const { body } = await request(app)
        .put(`/${menuId}`)
        .send({ name: 'Updated', visibility: 'private', rate: '15', archived: 'true' })
        .expect(200);

      expect(body).toMatchObject({
        name      : 'Updated',
        visibility: 'private',
        rate      : '15',
        archived  : true,
        photo     : '/Uploads/menus/test-image.jpg',
      });
      // old image removed?
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('old-image.jpg'));
    });

    it('404 when menu does not exist', async () => {
      const { body } = await request(app)
        .put('/64b3ad4257fe3f896b6ddead')          // random ObjectId
        .send({ name: 'X', visibility: 'public', rate: '5' })
        .expect(404);

      expect(body).toEqual({ error: 'Menu not found' });
    });
  });

  /* ----------------------- GET / ---------------------------------- */
  describe('GET /', () => {
    it('returns all menu items', async () => {
      await Menu.insertMany([
        { name: 'A', visibility: 'public', rate: '10' },
        { name: 'B', visibility: 'private', rate: '20' },
      ]);

      const { body } = await request(app).get('/').expect(200);
      expect(body.map(m => m.name).sort()).toEqual(['A', 'B']);
    });
  });

  /* ----------------------- GET /:id ------------------------------- */
  describe('GET /:id', () => {
    it('returns a single item', async () => {
      const menu = await Menu.create({ name: 'Solo', visibility: 'public', rate: '10' });

      const { body } = await request(app).get(`/${menu._id}`).expect(200);
      expect(body.name).toBe('Solo');
    });

    it('404 when not found', async () => {
      const { body } = await request(app).get('/64b3ad4257fe3f896b6ddead').expect(404);
      expect(body).toEqual({ error: 'Menu not found' });
    });
  });

  /* ----------------------- DELETE /:id ---------------------------- */
  describe('DELETE /:id', () => {
    it('deletes a menu item & its photo', async () => {
      const menu = await Menu.create({
        name      : 'Del',
        visibility: 'public',
        rate      : '10',
        photo     : '/Uploads/menus/test-image.jpg',
      });
    
      const { body } = await request(app).delete(`/${menu._id}`).expect(200);
      expect(body).toEqual({ message: 'Menu and related categories/products deleted successfully' }); // Updated message
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('test-image.jpg'));
      expect(await Menu.findById(menu._id)).toBeNull();
    });

    it('404 when not found', async () => {
      const { body } = await request(app).delete('/64b3ad4257fe3f896b6ddead').expect(404);
      expect(body).toEqual({ error: 'Menu not found' });
    });
  });

  /* ------------------ PUT /:id/archive ---------------------------- */
  describe('PUT /:id/archive', () => {
    it('archives a menu', async () => {
      const { _id } = await Menu.create({ name: 'Arc', visibility: 'public', rate: '5' });

      const { body } = await request(app).put(`/${_id}/archive`).expect(200);
      expect(body).toMatchObject({ message: 'Menu archived successfully', menu: { archived: true } });
    });

    it('400 if already archived', async () => {
      const { _id } = await Menu.create({ name: 'Arc', visibility: 'public', rate: '5', archived: true });

      const { body } = await request(app).put(`/${_id}/archive`).expect(400);
      expect(body).toEqual({ error: 'Menu is already archived' });
    });
  });

  /* ------------------ PUT /:id/restore ---------------------------- */
  describe('PUT /:id/restore', () => {
    it('restores a menu', async () => {
      const { _id } = await Menu.create({ name: 'Res', visibility: 'public', rate: '5', archived: true });

      const { body } = await request(app).put(`/${_id}/restore`).expect(200);
      expect(body).toMatchObject({ message: 'Menu restored successfully', menu: { archived: false } });
    });

    it('400 if not archived', async () => {
      const { _id } = await Menu.create({ name: 'Res', visibility: 'public', rate: '5' });

      const { body } = await request(app).put(`/${_id}/restore`).expect(400);
      expect(body).toEqual({ error: 'Menu is not archived' });
    });
  });
});
