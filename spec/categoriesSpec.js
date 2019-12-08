const request = require('supertest');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v1');

const { sign } = require('../controllers/helpers/sign');
const { server } = require('../server');
const { query } = require('../db');

xdescribe('Categories', () => {
  beforeAll(async () => {
    // A test admin to create employee accounts
    const insertAdminQuery = 'INSERT INTO users'
      + '(id, first_name, last_name, email, username, gender, role, department,'
      + ' password, type) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';
    const hashedPassword = await bcrypt.hash('aggreykey', 1);
    const adminValues = [
      uuid(), 'john', 'admin', 'john@mail.com', 'john', 'male', 'manager',
      'sales', hashedPassword, 'admin',
    ];

    await query(insertAdminQuery, adminValues);
    const selectUserQuery = 'SELECT id, type FROM users WHERE (email=$1)';
    const usersRes = await query(selectUserQuery, ['john@mail.com']);
    const [admin] = usersRes.rows;
    this.admin = admin;
    this.adminToken = sign(this.admin);
    this.admin.password = 'aggreykey';
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE id=$1', [this.admin.id]);
    if (this.category) {
      await query('DELETE FROM categories WHERE id=$1', [this.category.id]);
    }
  });

  describe('Admin sends category details for saving', () => {
    it('should respond with newly created category', (done) => {
      const newCategory = {
        name: 'DevOps',
        userId: this.admin.id,
      };

      request(server)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${this.adminToken}`)
        .send(newCategory)
        .expect(201)
        .then((resp) => {
          const { data } = resp.body;
          expect(data.name).toEqual(newCategory.name);
          this.category = data.result;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
