//
// const request = require('request');
//
// const endpoint = 'http://localhost:3000/api/v1/feed';
//
// xdescribe('/feed', () => {
//   describe('GET /?type=gif', () => {
//     it('should respond with latest gifs', (done) => {
//       request.post(`${endpoint}/?type=gif`, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(200);
//         return done();
//       });
//     });
//   });
//   describe('GET /?type=article', () => {
//     it('should respond with latest articles', (done) => {
//       request.post(`${endpoint}/?type=article`, (error, resp) => {
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
