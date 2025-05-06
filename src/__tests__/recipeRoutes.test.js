/*  src/__tests__/recipeRoutes.test.js  */

/* ================= dependencies ======================= */
const request  = require('supertest');
const express  = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/* ================= models ============================= */
const Recipe      = require('../models/Recipe');
const Product     = require('../models/Product');
const Category    = require('../models/Category');
const Ingredieent = require('../models/Ingredieent');
const Ustensile   = require('../models/Ustensile');
const Variant     = require('../models/recipeVariant');
const Dish        = require('../models/DishOfTheDay');  // ✅

/* ================= mocks ( BEFORE router import ) ===== */
jest.mock('fs', () => {
  const real = jest.requireActual('fs');
  return { ...real, existsSync: jest.fn(() => true), mkdirSync: jest.fn(), unlinkSync: jest.fn() };
});

jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    fields: jest.fn(() => (req, _res, next) => {
      req.files = { images: [{ filename: 'img.jpg', originalname: 'img.jpg', mimetype: 'image/jpeg' }] };
      next();
    }),
  }));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

/* ================= router ============================ */
const recipeRouter = require('../modules/MenuMangment/recipeRoutes'); // ajuste le chemin si besoin

/* ================= app + mongo mémoire =============== */
const app = express();
app.use(express.json());
app.use('/', recipeRouter);

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
    Recipe.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Ingredieent.deleteMany({}),
    Ustensile.deleteMany({}),
    Variant.deleteMany({}),
    Dish.deleteMany({}),                           // ✅
  ]);
});

/* =============== helpers ============================== */
async function seedMinimalProduct() {
  const category = await Category.create({ libelle: 'Plats', visibility: 'visible' });
  const product  = await Product.create({
    name: 'Burger', price: 12, categoryFK: category._id,
    typePlat: Product.schema.path('typePlat').enumValues[0],
  });
  return { category, product };
}

async function seedIngredieent() {
  return await Ingredieent.create({
    libelle: 'Sel', quantity: 1000, price: 1,
    type: 'epice', disponibility: true, qtMax: 500,
  });
}

/* ================= tests ============================== */
describe('Recipe routes', () => {

  /* ---------- POST ----------------------------------- */
  describe('POST /', () => {
    it('creates a recipe', async () => {
      const { product } = await seedMinimalProduct();
      const ingr         = await seedIngredieent();

      const payload = {
        nom              : 'Recette A',
        temps_preparation: '10',
        temps_cuisson    : '20',
        productFK        : product._id.toString(),
        ingredientsGroup : JSON.stringify([
        { title: 'grp', items: [{ ingredient: ingr._id, customQuantity: '20g' }] },
        ]),
        utensils         : JSON.stringify([]),
        decoration       : JSON.stringify([]),
        steps            : JSON.stringify([]),
        variants         : JSON.stringify([]),
      };

      const { body } = await request(app).post('/').send(payload).expect(201);
      expect(body.nom).toBe('Recette A');
      expect(body.productFK._id).toBe(product._id.toString());
      expect(body.images[0]).toMatch(/img\.jpg$/);
    });

    it('400 if required field missing', async () => {
      const { body } = await request(app).post('/').send({ nom: 'Sans le reste' }).expect(400);
      expect(body.message).toMatch(/required/i);
    });
  });

  /* ---------- GET list & single ---------------------- */
  describe('GET list & single', () => {
    let recipeId;
    beforeEach(async () => {
      const { product } = await seedMinimalProduct();
      recipeId = (await Recipe.create({
        nom: 'List', temps_preparation: '5', temps_cuisson: '5', productFK: product._id,
      }))._id.toString();
    });

    it('GET / returns all', async () => {
      const { body } = await request(app).get('/').expect(200);
      expect(body.length).toBe(1);
    });

    it('GET /:id returns one', async () => {
      const { body } = await request(app).get(`/${recipeId}`).expect(200);
      expect(body._id).toBe(recipeId);
    });

    it('GET /:id 404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      await request(app).get(`/${fake}`).expect(404);
    });
  });

  /* ---------- PUT /:id ------------------------------ */
  describe('PUT /:id', () => {
    let recipeId, product;
    beforeEach(async () => {
      ({ product } = await seedMinimalProduct());
      recipeId = (await Recipe.create({
        nom:'ToUpdate', temps_preparation:'3', temps_cuisson:'4', productFK: product._id,
      }))._id.toString();
    });

    it('updates recipe & replaces images', async () => {
      const { body } = await request(app)
        .put(`/${recipeId}`)
        .send({
          nom                     : 'Updated',
          productFK               : product._id.toString(),
          ingredientsGroup        : JSON.stringify([{ title:'grp', items:[] }]),
          utensils                : JSON.stringify([]),
          decoration              : JSON.stringify([]),
          steps                   : JSON.stringify([]),
          variants                : JSON.stringify([]),
        })
        .expect(200);

      expect(body.nom).toBe('Updated');
      expect(body.images[0]).toMatch(/img\.jpg$/);
    });

    it('404 when recipe not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      await request(app).put(`/${fake}`).send({ nom:'X', ingredientsGroup:'[]', steps:'[]' }).expect(404);
    });
  });

  /* ---------- DELETE /:id --------------------------- */
  describe('DELETE /:id', () => {
    let recipeId;
    beforeEach(async () => {
      const { product } = await seedMinimalProduct();
      recipeId = (await Recipe.create({
        nom:'Delete', temps_preparation:'3', temps_cuisson:'4',
        productFK: product._id, images:['/Uploads/Plats/recipes/img.jpg'],
      }))._id.toString();
    });

    it('deletes recipe', async () => {
      await request(app).delete(`/${recipeId}`).expect(200);
      expect(await Recipe.findById(recipeId)).toBeNull();
    });

    it('404 when not found', async () => {
      const fake = new mongoose.Types.ObjectId();
      await request(app).delete(`/${fake}`).expect(404);
    });
  });
});
