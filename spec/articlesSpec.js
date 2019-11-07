// const request = require('request');
//
// const endpoint = 'http://localhost:3000/api/v1/articles';
//
// xdescribe('/articles', () => {
//   describe('POST /', () => {
//     it('should respond with created article', (done) => {
//       request.post(`${endpoint}`, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(201);
//         return done();
//       });
//     });
//   });
//   describe('PATCH /:id', () => {
//     it('should respond with updated article', (done) => {
//       const id = 1; // Be sure to check this later
//       request.patch(`${endpoint}/{${id}}`, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(200);
//         return done();
//       });
//     });
//   });
//   describe('DELETE /:id', () => {
//     it('should respond with success message', (done) => {
//       const id = 1; // Be sure to check this later
//       request.delete(`${endpoint}/{${id}}`, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(200);
//         return done();
//       });
//     });
//   });
//   describe('POST /:id/comment', () => {
//     it('should respond with created comment', (done) => {
//       request.post(`${endpoint}`, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(201);
//         return done();
//       });
//     });
//   });
//   describe('GET /:id', () => {
//     it('should respond with article with specified id', (done) => {
//       const id = 1; // Be sure to check this later
//       request.get(`${endpoint}/{${id}}`, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(200);
//         return done();
//       });
//     });
//   });
// });
