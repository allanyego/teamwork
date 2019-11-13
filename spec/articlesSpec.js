const request = require('supertest');
const uuid = require('uuid/v1');

const { sign } = require('../controllers/helpers/sign');
const { query } = require('../db');
const { server } = require('../server');

describe('Articles - ', () => {
  beforeAll(async () => {
    this.article = {
      title: 'Me and the hommies',
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
        ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.`,
    };
    this.article2 = {
      title: 'Huncho plause',
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
        ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.`,
    };

    // A test user to post a article
    const userId = uuid();
    const insertUserQuery = 'INSERT INTO users'
      + '(id, first_name, last_name, email, username, gender, role, department,'
      + ' password) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)';
    const userValues = [
      userId, 'jane', 'writer', 'jane@mail.com', 'jane', 'female', 'manager',
      'marketing', 'aggreykey',
    ];

    // A test user to post a comment
    const insertCommenterQuery = 'INSERT INTO users'
      + '(id, first_name, last_name, email, username, gender, role, department,'
      + 'password) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)';
    const commenterValues = [
      uuid(), 'mary', 'holly', 'mary@mail.com', 'holly', 'female', 'assistant',
      'procurement', 'purpleblue',
    ];

    const salesId = uuid();
    const insertSalesCategory = 'INSERT INTO categories'
      + '(id, name, user_id) VALUES($1,$2,$3)';
    const salesValues = [
      salesId, 'sales', userId,
    ];

    const procurementId = uuid();
    const insertProcurementCategory = 'INSERT INTO categories'
      + '(id, name, user_id) VALUES($1,$2,$3)';
    const procurementValues = [
      procurementId, 'procurement', userId,
    ];

    await query(insertUserQuery, userValues);
    const selectUserQuery = 'SELECT * FROM users WHERE (email=$1)';
    const usersRes = await query(selectUserQuery, ['jane@mail.com']);
    await query(insertCommenterQuery, commenterValues);
    const selectCommenterQuery = 'SELECT * FROM users WHERE (email=$1)';
    const commenterRes = await query(selectCommenterQuery, ['mary@mail.com']);
    const [commenter] = commenterRes.rows;
    this.commenter = commenter;

    await query(insertSalesCategory, salesValues);
    const selectSalesCategory = 'SELECT * FROM categories WHERE (id=$1)';
    const salesRes = await query(selectSalesCategory, [salesId]);

    await query(insertProcurementCategory, procurementValues);
    const selectProcurementCategory = 'SELECT * FROM categories WHERE (id=$1)';
    const procurementRes = await query(selectProcurementCategory, [procurementId]);

    const [user] = usersRes.rows;
    const [sales] = salesRes.rows;
    const [procurement] = procurementRes.rows;

    this.user = user;
    this.salesCategory = sales;
    this.procurementCategory = procurement;
    this.userToken = sign(this.user);
    this.commenterToken = sign(this.commenter);

    this.article.userId = this.user.id;
    this.article.category = sales.id;

    this.article2.userId = this.user.id;
    this.article2.category = procurement.id;
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE id=$1', [this.user.id]);
    await query('DELETE FROM users WHERE id=$1', [this.commenter.id]);
    await query('DELETE FROM categories WHERE id=$1', [this.salesCategory.id]);
    await query(
      'DELETE FROM categories WHERE id=$1',
      [this.procurementCategory.id],
    );
    if (this.article.id) {
      await query('DELETE FROM articles WHERE id=$1', [this.article.id]);
    }
    if (this.article2.id) {
      await query('DELETE FROM articles WHERE id=$1', [this.article2.id]);
    }
    if (this.comment.id) {
      await query('DELETE FROM comments WHERE id=$1', [this.comment.id]);
    }
    if (this.flag.id) {
      await query('DELETE FROM comments WHERE id=$1', [this.flag.id]);
    }
  });

  describe('/articles', () => {
    describe('POST /', () => {
      describe('posting 1st article', () => {
        it('should respond with created article', (done) => {
          request(server)
            .post('/api/v1/articles')
            .set('Authorization', `Bearer ${this.userToken}`)
            .send(this.article)
            .expect(201)
            .then((resp) => {
              const { data } = resp.body;
              expect(data.id).toBeDefined();
              expect(data.title).toEqual(this.article.title);
              this.article = resp.body.data;
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
      });
      describe('posting 2nd article', () => {
        it('should respond with 2nd created article', (done) => {
          request(server)
            .post('/api/v1/articles')
            .set('Authorization', `Bearer ${this.userToken}`)
            .send(this.article2)
            .expect(201)
            .then((resp) => {
              const { data } = resp.body;
              expect(data.id).toBeDefined();
              expect(data.title).toEqual(this.article2.title);
              this.article2 = resp.body.data;
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
      });
    });
    describe('GET /:id', () => {
      it('should respond with article with specified id', (done) => {
        request(server)
          .get(`/api/v1/articles/${this.article.id}`)
          .expect(200)
          .then((resp) => {
            const { data } = resp.body;
            expect(data.title).toEqual(this.article.title);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    describe('GET /?category=XXX', () => {
      it('should respond with article of specified category', (done) => {
        request(server)
          .get('/api/v1/articles?category=procurement')
          .expect(200)
          .then((resp) => {
            const { data } = resp.body;
            expect(data[0].category.name).toEqual('procurement');
            this.comment = data;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    describe('PATCH /:id', () => {
      it('should respond with updated article', (done) => {
        const newTitle = 'I had to change this article';
        request(server)
          .patch(`/api/v1/articles/${this.article.id}`)
          .set('Authorization', `Bearer ${this.userToken}`)
          .send({ title: newTitle })
          .expect(200)
          .then((resp) => {
            const { data } = resp.body;
            expect(data.title).toEqual(newTitle);
            this.article = data;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    describe('POST /:id/comment', () => {
      it('should respond with created comment', (done) => {
        const comment = {
          comment: 'Wow, we have our first comment.',
          userId: this.commenter.id,
          article: this.article.id,
        };

        request(server)
          .post(`/api/v1/articles/${this.article.id}/comment`)
          .send(comment)
          .set('Authorization', `Bearer ${this.commenterToken}`)
          .expect(201)
          .then((resp) => {
            const { data } = resp.body;
            expect(data.article).toBeDefined();
            expect(data.comment).toEqual(comment.comment);
            this.comment = data;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    describe('POST /:id/flag', () => {
      describe('user sends a new flag', () => {
        it('should respond with posted flag', (done) => {
          const flag = {
            feedback: 'I find this offensive.',
            userId: this.commenter.id,
            article: this.article.id,
          };

          request(server)
            .post(`/api/v1/articles/${this.article.id}/flag`)
            .send(flag)
            .set('Authorization', `Bearer ${this.commenterToken}`)
            .expect(201)
            .then((resp) => {
              const { data } = resp.body;
              expect(data.status).toEqual('pending');
              expect(data.feedback).toEqual(flag.feedback);
              this.flag = data;
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
      });
      describe('user sends similar flag details as before', () => {
        it('should respond with an error message', (done) => {
          const flag = {
            feedback: 'I find this offensive.',
            userId: this.commenter.id,
            article: this.article.id,
          };

          request(server)
            .post(`/api/v1/articles/${this.article.id}/flag`)
            .send(flag)
            .set('Authorization', `Bearer ${this.commenterToken}`)
            .expect(200)
            .then((resp) => {
              const { status } = resp.body;
              expect(status).toEqual('error');
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
      });
    });
  });

  describe('/feed', () => {
    describe('GET /', () => {
      it('should respond with an ordered array of articles', (done) => {
        request(server)
          .get('/api/v1/feed')
          .expect(200)
          .then((resp) => {
            const { data } = resp.body;
            expect(data[0].createdAt).toBeGreaterThan(data[1].createdAt);
            expect(data.length).toBeGreaterThan(0);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
  });

  describe('/articles', () => {
    describe('DELETE /:id', () => {
      it('should respond with success message', (done) => {
        request(server)
          .delete(`/api/v1/articles/${this.article.id}`)
          .set('Authorization', `Bearer ${this.userToken}`)
          .expect(204)
          .then(done)
          .catch((err) => {
            done(err);
          });
      });
    });
  });
});
