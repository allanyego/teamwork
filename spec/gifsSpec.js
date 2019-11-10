// const request = require('supertest');
// const uuid = require('uuid/v1');
//
// const { query } = require('../db');
// const { server } = require('../server');
//
// describe('/gifs', () => {
//   beforeAll(async () => {
//     this.gif = {
//       title: 'Me and the hommies',
//     };
//
//     // A test user to post a gif
//     const insertUserQuery = 'INSERT INTO users'
//       + '(id, first_name, last_name, email, username, gender, role, department,'
//       + ' password) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9)';
//     const userValues = [
//       uuid(), 'john', 'hopkins', 'john@mail.com', 'john', 'male', 'manager',
//       'sales', 'aggreykey',
//     ];
//
//     await query(insertUserQuery, userValues);
//     const selectUserQuery = 'SELECT * FROM users WHERE (email=$1)';
//     const usersRes = await query(selectUserQuery, ['john@mail.com']);
//     const [user] = usersRes.rows;
//     this.user = user;
//
//     // A test user to post a comment
//     const insertCommenterQuery = 'INSERT INTO users'
//       + '(id, first_name, last_name, email, username, gender, role, department,'
//       + 'password) VALUES($1,$2,$3,$4,$5,$6,$7,$8, $9)';
//     const commenterValues = [
//       uuid(), 'mary', 'holly', 'mary@mail.com', 'holly', 'female', 'assistant',
//       'procurement', 'purpleblue',
//     ];
//
//     await query(insertCommenterQuery, commenterValues);
//     const selectCommenterQuery = 'SELECT * FROM users WHERE (email=$1)';
//     const commenterRes = await query(selectCommenterQuery, ['john@mail.com']);
//     const [commenter] = commenterRes.rows;
//     this.commenter = commenter;
//
//     // The category the gif will belong to
//     const insertCategoryQuery = 'INSERT INTO categories'
//       + '(id, name, user_id) VALUES($1,$2,$3)';
//     const categoryValues = [uuid(), 'Project Blue Book', user.id];
//
//     await query(insertCategoryQuery, categoryValues);
//     const selectCategoryQuery = 'SELECT * FROM categories WHERE (name=$1)';
//     const categoryRes = await query(selectCategoryQuery, ['Project Blue Book']);
//     const [category] = categoryRes.rows;
//     this.category = category;
//   });
//
//   afterAll(async () => {
//     await query('DELETE FROM users WHERE id=$1', [this.user.id]);
//
//     await query('DELETE FROM users WHERE id=$1', [this.commenter.id]);
//
//     await query('DELETE FROM gifs WHERE (id=$1)', [this.gif.id]);
//
//     await query('DELETE FROM categories WHERE (id=$1)', [this.category.id]);
//   });
//
//   describe('POST /', () => {
//     it('should respond with created gif', (done) => {
//       request(server)
//         .post('/api/v1/gifs')
//         .field('category', this.category.id)
//         .field('title', this.gif.title)
//         .field('userId', this.user.id)
//         .field('image', 'image gif')
//         .attach('image', `${__dirname}/bikey.gif`)
//         .expect(201)
//         .then((resp) => {
//           const { data } = resp.body;
//           expect(data.id).toBeDefined();
//           this.gif = resp.body.data;
//           done();
//         })
//         .catch((err) => {
//           done(err);
//         });
//     });
//   });
//   describe('GET /', () => {
//     it('should respond with an array of gifs', (done) => {
//       request(server)
//         .get('/api/v1/gifs')
//         .expect(200)
//         .then((resp) => {
//           const { data } = resp.body;
//           expect(data.length).toBeGreaterThan(0);
//           done();
//         })
//         .catch((err) => {
//           done(err);
//         });
//     });
//   });
//   describe('GET /:id', () => {
//     it('should respond with gif with specified id', (done) => {
//       request(server)
//         .get(`/api/v1/gifs/${this.gif.id}`)
//         .expect(200)
//         .then((resp) => {
//           const { data } = resp.body;
//           expect(data.title).toEqual(this.gif.title);
//           done();
//         })
//         .catch((err) => {
//           done(err);
//         });
//     });
//   });
//   describe('PATCH /:id', () => {
//     it('should respond with updated gif', (done) => {
//       const newTitle = 'I had to change this gif';
//       request(server)
//         .patch(`/api/v1/gifs/${this.gif.id}`)
//         .field('title', newTitle)
//         .field('image', 'new gif image')
//         .attach('image', `${__dirname}/bikey1.gif`)
//         .expect(200)
//         .then((resp) => {
//           const { data } = resp.body;
//           expect(data.title).toEqual(newTitle);
//           done();
//         })
//         .catch((err) => {
//           done(err);
//         });
//     });
//   });
//   describe('POST /:id/comment', () => {
//     it('should respond with created comment', (done) => {
//       const comment = {
//         comment: 'Wow, we have our first comment.',
//         userId: this.commenter.id,
//         gif: this.gif.id,
//       };
//
//       request(server)
//         .post(`/api/v1/gifs/${this.gif.id}/comment`)
//         .send(comment)
//         .expect(201)
//         .then((resp) => {
//           const { data } = resp.body;
//           expect(data.comment).toEqual(comment.comment);
//           done();
//         })
//         .catch((err) => {
//           done(err);
//         });
//     });
//   });
//
//   describe('DELETE /:id', () => {
//     it('should respond with success message', (done) => {
//       request(server)
//         .delete(`/api/v1/gifs/${this.gif.id}`)
//         .expect(200)
//         .then((resp) => {
//           const { data } = resp.body;
//           expect(data).toEqual('The gif was deleted successfully.');
//           done();
//         })
//         .catch((err) => {
//           done(err);
//         });
//     });
//   });
// });
