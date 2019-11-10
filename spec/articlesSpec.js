const request = require('supertest');
const uuid = require('uuid/v1');

const { sign } = require('../controllers/helpers/sign');
const { query } = require('../db');
const { server } = require('../server');

describe('/articles', () => {
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

    // A test user to post a article
    const userId = uuid();
    const insertUserQuery = 'INSERT INTO users'
      + '(id, first_name, last_name, email, username, gender, role, department,'
      + ' password) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9)';
    const userValues = [
      userId, 'jane', 'writer', 'jane@mail.com', 'jane', 'female', 'manager',
      'marketing', 'aggreykey',
    ];

    const insertCategoryQuery = 'INSERT INTO categories'
      + '(id, name, user_id) VALUES($1,$2,$3)';
    const categoryValues = [
      uuid(), 'The undones', userId,
    ];

    await query(insertUserQuery, userValues);
    const selectUserQuery = 'SELECT * FROM users WHERE (email=$1)';
    const usersRes = await query(selectUserQuery, ['jane@mail.com']);

    await query(insertCategoryQuery, categoryValues);
    const selectCategoryQuery = 'SELECT * FROM categories WHERE (user_id=$1)';
    const categoryRes = await query(selectCategoryQuery, [userId]);

    const [user] = usersRes.rows;
    const [category] = categoryRes.rows;
    this.user = user;
    this.category = category;
    this.userToken = sign(this.user);
    this.article.userId = this.user.id;
    this.article.category = category.id;
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE id=$1', [this.user.id]);
    await query('DELETE FROM categories WHERE id=$1', [this.category.id]);
    if (this.article.id) {
      await query('DELETE FROM articles WHERE id=$1', [this.article.id]);
    }
  });

  describe('POST /', () => {
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
  xdescribe('GET /', () => {
    it('should respond with an array of gifs', (done) => {
      request(server)
        .get('/api/v1/gifs')
        .expect(200)
        .then((resp) => {
          const { data } = resp.body;
          expect(data.length).toBeGreaterThan(0);
          done();
        })
        .catch((err) => {
          done(err);
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
  xdescribe('POST /:id/comment', () => {
    it('should respond with created comment', (done) => {
      const comment = {
        comment: 'Wow, we have our first comment.',
        userId: this.commenter.id,
        gif: this.gif.id,
      };

      request(server)
        .post(`/api/v1/gifs/${this.gif.id}/comment`)
        .send(comment)
        .expect(201)
        .then((resp) => {
          const { data } = resp.body;
          expect(data.comment).toEqual(comment.comment);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  xdescribe('DELETE /:id', () => {
    it('should respond with success message', (done) => {
      request(server)
        .delete(`/api/v1/gifs/${this.gif.id}`)
        .expect(200)
        .then((resp) => {
          const { data } = resp.body;
          expect(data).toEqual('The gif was deleted successfully.');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
