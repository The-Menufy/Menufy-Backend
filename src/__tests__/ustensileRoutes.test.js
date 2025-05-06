/*  src/__tests__/ustensileRoutes.test.js  */

/* ---------------- dependencies ------------------------- */
const request  = require('supertest');
const express  = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/* ---------------- models ------------------------------- */
const Ustensile = require('../models/Ustensile');

/* ---------------- mocks (must come BEFORE router import) */
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

/* ---------------- router (import AFTER mocks) --------- */
const ustensileRouter = require('../modules/MenuMangment/ustensile'); // adjust path if needed

/* ---------------- express app & in‑memory Mongo -------- */
const app = express();
app.use(express.json());
app.use('/', ustensileRouter);

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
  await Ustensile.deleteMany({});
  jest.clearAllMocks();
});

/* =================== TESTS ============================ */
describe('Ustensile Routes', () => {
  /* POST ---------------------------------------------- */
  describe('POST /', () => {
    it('creates a ustensile', async () => {
      const { body } = await request(app)
        .post('/')
        .send({
          libelle      : 'Couteau',
          quantity     : '5',
          disponibility: 'true',
        })
        .expect(201);

      expect(body).toMatchObject({
        libelle      : 'Couteau',
        quantity     : 5,
        disponibility: true,
        archived     : false,
        photo        : '/Uploads/ustensiles/test-image.jpg',
      });
    });

    it('400 when required fields missing', async () => {
      const { body } = await request(app)
        .post('/')
        .send({ libelle: 'X' })
        .expect(400);

      expect(body).toHaveProperty('error');
    });
  });

  /* READS --------------------------------------------- */
  describe('Reads', () => {
    let id;
    beforeEach(async () => {
      id = (await Ustensile.create({
        libelle      : 'Cuillère',
        quantity     : 10,
        disponibility: true,
      }))._id.toString();
    });

    it('GET / returns all', async () => {
      const { body } = await request(app).get('/').expect(200);
      expect(body.length).toBe(1);
      expect(body[0]._id).toBe(id);
    });

    it('GET /:id returns one', async () => {
      const { body } = await request(app).get(`/${id}`).expect(200);
      expect(body._id).toBe(id);
    });

    it('GET /:id 404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app).get(`/${fake}`).expect(404);
      expect(body).toEqual({ error: 'Ustensile not found' });
    });
  });

  /* PUT ----------------------------------------------- */
  describe('PUT /:id', () => {
    let id;
    beforeEach(async () => {
      id = (await Ustensile.create({
        libelle      : 'Fouet',
        quantity     : 3,
        disponibility: true,
        photo        : '/Uploads/ustensiles/old.jpg',
      }))._id.toString();
    });

    it('updates and replaces photo', async () => {
      const { body } = await request(app)
        .put(`/${id}`)
        .send({
          libelle      : 'Fouet inox',
          quantity     : '4',
          disponibility: 'false',
          archived     : 'true',
        })
        .expect(200);

      expect(body).toMatchObject({
        libelle      : 'Fouet inox',
        quantity     : 4,
        disponibility: false,
        archived     : true,
        photo        : '/Uploads/ustensiles/test-image.jpg',
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('old.jpg'));
    });

    it('404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app)
        .put(`/${fake}`)
        .send({
          libelle      : 'X',
          quantity     : '1',
          disponibility: 'true',
        })
        .expect(404);
      expect(body).toEqual({ error: 'Ustensile not found' });
    });
  });

  /* DELETE --------------------------------------------- */
  describe('DELETE /:id', () => {
    let id;
    beforeEach(async () => {
      id = (await Ustensile.create({
        libelle      : 'Louche',
        quantity     : 2,
        disponibility: true,
        photo        : '/Uploads/ustensiles/test-image.jpg',
      }))._id.toString();
    });

    it('deletes ustensile & photo', async () => {
      const { body } = await request(app).delete(`/${id}`).expect(200);
      expect(body).toEqual({ message: 'Ustensile deleted successfully' });
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('test-image.jpg'));
      expect(await Ustensile.findById(id)).toBeNull();
    });

    it('404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      const { body } = await request(app).delete(`/${fake}`).expect(404);
      expect(body).toEqual({ error: 'Ustensile not found' });
    });
  });

  /* ARCHIVE / RESTORE ---------------------------------- */
  describe('Archive / restore', () => {
    let id;
    beforeEach(async () => {
      id = (await Ustensile.create({
        libelle      : 'Spatule',
        quantity     : 6,
        disponibility: true,
      }))._id.toString();
    });

    it('archives a ustensile', async () => {
      const { body } = await request(app).put(`/${id}/archive`).expect(200);
      expect(body.ustensile.archived).toBe(true);
    });

    it('400 if already archived', async () => {
      await Ustensile.findByIdAndUpdate(id, { archived: true });
      const { body } = await request(app).put(`/${id}/archive`).expect(400);
      expect(body).toEqual({ error: 'Ustensile is already archived' });
    });

    it('restores a ustensile', async () => {
      await Ustensile.findByIdAndUpdate(id, { archived: true });
      const { body } = await request(app).put(`/${id}/restore`).expect(200);
      expect(body.ustensile.archived).toBe(false);
    });

    it('400 if not archived', async () => {
      const { body } = await request(app).put(`/${id}/restore`).expect(400);
      expect(body).toEqual({ error: 'Ustensile is not archived' });
    });
  });
});
