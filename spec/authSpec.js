const request = require('supertest');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v1');

const { server } = require('../server');
const { query } = require('../db');

describe('/auth', () => {
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
    const selectUserQuery = 'SELECT email FROM users WHERE (email=$1)';
    const usersRes = await query(selectUserQuery, ['john@mail.com']);
    const [admin] = usersRes.rows;
    this.admin = admin;
    this.admin.password = 'aggreykey';
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE id=$1', [this.admin.id]);
    if (this.user) {
      await query('DELETE FROM users WHERE id=$1', [this.user.id]);
    }
  });

  describe('/signin', () => {
    it('should respond with created user', async (done) => {
      request(server)
        .post('/api/v1/auth/signin')
        .send(this.admin)
        .expect(200)
        .then((resp) => {
          const { data } = resp.body;
          expect(data.token).toBeDefined();
          expect(data.email).toEqual(this.admin.email);
          this.admin = data;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('/create-user', () => {
    it('should respond with created user', async (done) => {
      const user = {
        username: 'alova',
        firstName: 'mbabu',
        lastName: 'obwa',
        email: 'aloha@mail.com',
        password: 'alovambabu',
        department: 'procurement',
        role: 'auditer',
        gender: 'female',
      };

      request(server)
        .post('/api/v1/auth/create-user')
        .send(user)
        .set('Authorization', `Bearer ${this.admin.token}`)
        .expect(201)
        .then((resp) => {
          const { data } = resp.body;
          expect(data.id).toBeDefined();
          this.user = data;
          this.user.password = user.password;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
