const request = require('supertest');
const uuid = require('uuid/v1');
const cloudinary = require('cloudinary').v2;

const { sign } = require('../controllers/helpers/sign');
const { query } = require('../db');
const { server } = require('../server');

xdescribe('Gifs - ', () => {
  beforeAll(async () => {
    this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    this.gif = {
      title: 'Me and the hommies',
    };
    this.gif2 = {
      title: 'All the fun of debugging.',
    };

    // A test user to post a gif
    const insertUserQuery = 'INSERT INTO users'
      + '(id, first_name, last_name, email, username, gender, role, department,'
      + ' password) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9)';
    const userValues = [
      uuid(), 'john', 'hopkins', 'john@mail.com', 'john', 'male', 'manager',
      'sales', 'aggreykey',
    ];

    await query(insertUserQuery, userValues);
    const selectUserQuery = 'SELECT * FROM users WHERE (email=$1)';
    const usersRes = await query(selectUserQuery, ['john@mail.com']);
    const [user] = usersRes.rows;
    this.user = user;

    // A test user to post a comment
    const insertCommenterQuery = 'INSERT INTO users'
      + '(id, first_name, last_name, email, username, gender, role, department,'
      + 'password) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9)';
    const commenterValues = [
      uuid(), 'mary', 'holly', 'mary@mail.com', 'holly', 'female', 'assistant',
      'procurement', 'purpleblue',
    ];

    await query(insertCommenterQuery, commenterValues);
    const selectCommenterQuery = 'SELECT * FROM users WHERE (email=$1)';
    const commenterRes = await query(selectCommenterQuery, ['mary@mail.com']);
    const [commenter] = commenterRes.rows;
    this.commenter = commenter;

    // The gif categories
    const insertFunCategory = 'INSERT INTO categories'
      + '(id, name, user_id) VALUES($1,$2,$3)';
    const funValues = [uuid(), 'fun', user.id];

    const insertDevCategory = 'INSERT INTO categories'
      + '(id, name, user_id) VALUES($1,$2,$3)';
    const devValues = [uuid(), 'dev', user.id];

    await query(insertFunCategory, funValues);
    const selectFun = 'SELECT * FROM categories WHERE (name=$1)';
    const funRes = await query(selectFun, ['fun']);

    await query(insertDevCategory, devValues);
    const selectDev = 'SELECT * FROM categories WHERE (name=$1)';
    const devRes = await query(selectDev, ['dev']);

    const [fun] = funRes.rows;
    this.funCategory = fun;

    const [dev] = devRes.rows;
    this.devCategory = dev;
    this.userToken = sign(this.user);
    this.commenterToken = sign(this.commenter);
  });

  afterAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;

    await query(
      'DELETE FROM users WHERE id=$1 OR email=$2',
      [this.user.id, 'mary@mail.com'],
    );

    await query('DELETE FROM gifs WHERE (id=$1)', [this.gif.id]);
    await query('DELETE FROM gifs WHERE (id=$1)', [this.gif2.id]);
    await cloudinary.uploader.destroy(this.gif.id);
    await cloudinary.uploader.destroy(this.gif2.id);

    await query('DELETE FROM categories WHERE (id=$1)', [this.funCategory.id]);
    await query('DELETE FROM categories WHERE (id=$1)', [this.devCategory.id]);
  });

  describe('/gifs', () => {
    describe('POST /', () => {
      describe('post 1st gif', () => {
        it('should respond with created gif', (done) => {
          request(server)
            .post('/api/v1/gifs')
            .field('category', this.funCategory.id)
            .field('title', this.gif.title)
            .field('userId', this.user.id)
            .field('image', 'image gif')
            .attach('image', `${__dirname}/bikey.gif`)
            .set('Authorization', `Bearer ${this.userToken}`)
            .expect(201)
            .then((resp) => {
              const { data } = resp.body;
              expect(data.id).toBeDefined();
              this.gif = data;
              done();
            })
            .catch(done);
        });
      });
      describe('posting the 2nd gif', () => {
        it('should respond with created gif', (done) => {
          request(server)
            .post('/api/v1/gifs')
            .field('category', this.devCategory.id)
            .field('title', this.gif2.title)
            .field('userId', this.user.id)
            .field('image', 'image gif')
            .attach('image', `${__dirname}/coder.gif`)
            .set('Authorization', `Bearer ${this.userToken}`)
            .expect(201)
            .then((resp) => {
              const { data } = resp.body;
              expect(data.id).toBeDefined();
              this.gif2 = data;
              done();
            })
            .catch(done);
        });
      });
    });
    describe('GET /feed?type=gif', () => {
      it('should respond with an ordered array of gifs', (done) => {
        request(server)
          .get('/api/v1/feed?type=gif')
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
    describe('GET /:id', () => {
      it('should respond with gif with specified id', (done) => {
        request(server)
          .get(`/api/v1/gifs/${this.gif.id}`)
          .expect(200)
          .then((resp) => {
            const { data } = resp.body;
            expect(data.title).toEqual(this.gif.title);
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
          .get('/api/v1/gifs?category=dev')
          .expect(200)
          .then((resp) => {
            const { data } = resp.body;
            expect(data[0].category.name).toEqual('dev');
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    describe('PATCH /:id', () => {
      it('should respond with updated gif', (done) => {
        const newTitle = 'I had to change this gif';
        request(server)
          .patch(`/api/v1/gifs/${this.gif.id}`)
          .field('title', newTitle)
          .field('image', 'new gif image')
          .field('userId', this.user.id)
          .attach('image', `${__dirname}/bikey1.gif`)
          .set('Authorization', `Bearer ${this.userToken}`)
          .expect(200)
          .then((resp) => {
            const { data } = resp.body;
            expect(data.title).not.toEqual(this.gif.title);
            this.gif = data;
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
          comment: 'Yo!, we have our first gif comment. :)',
          userId: this.commenter.id,
          gif: this.gif.id,
        };

        request(server)
          .post(`/api/v1/gifs/${this.gif.id}/comment`)
          .send(comment)
          .set('Authorization', `Bearer ${this.commenterToken}`)
          .expect(201)
          .then((resp) => {
            const { data } = resp.body;
            expect(data.gif).toBeDefined();
            expect(data.comment).toEqual(comment.comment);
            this.comment = data;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
  });

  describe('/comments/:id/flag', () => {
    describe('POST / : user sends a new flag', () => {
      it('should respond with posted flag', (done) => {
        const flag = {
          feedback: 'That was savage',
          userId: this.user.id,
          comment: this.comment.id,
        };

        request(server)
          .post(`/api/v1/comments/${this.comment.id}/flag`)
          .send(flag)
          .set('Authorization', `Bearer ${this.userToken}`)
          .expect(201)
          .then((resp) => {
            const { data } = resp.body;
            expect(data.status).toEqual('pending');
            expect(data.comment).toBeDefined();
            this.flag = data;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
    describe('POST / : user sends similar flag details as before', () => {
      it('should respond with an erro message', (done) => {
        const flag = {
          feedback: 'That was savage',
          userId: this.user.id,
          comment: this.comment.id,
        };

        request(server)
          .post(`/api/v1/comments/${this.comment.id}/flag`)
          .send(flag)
          .set('Authorization', `Bearer ${this.userToken}`)
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

  describe('/feed', () => {
    describe('GET / [?type=gif]', () => {
      it('should respond with an ordered array of articles', (done) => {
        request(server)
          .get('/api/v1/feed?type=gif')
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

  describe('/gifs', () => {
    describe('DELETE /:id', () => {
      it('should respond with success message', (done) => {
        request(server)
          .delete(`/api/v1/gifs/${this.gif.id}`)
          .set('Authorization', `Bearer ${this.userToken}`)
          .expect(204)
          .then(done())
          .catch((err) => {
            done(err);
          });
      });
    });
  });
});
