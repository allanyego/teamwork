// const request = require('request');
//
// const { query } = require('../db');
//
// const endpoint = 'http://localhost:3000/api/v1/auth';
//
// xdescribe('/auth', () => {
//   const user = {
//     username: 'alova',
//     firstName: 'mbabu',
//     lastName: 'obwa',
//     email: 'aloha@mail.com',
//     password: 'alovambabu',
//     confirmPassword: 'alovambabo',
//     department: 'Procurement',
//     role: 'auditer',
//     gender: 'female',
//   };
//
//   afterAll(async (done) => {
//     await query('DELETE FROM users WHERE id=$1', [user.id]);
//     done();
//   });
//
//   xdescribe('/create-user', () => {
//     it('should respond with created user', async (done) => {
//       request.post(`${endpoint}/create-user`, {
//         ...user,
//       }, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(201);
//         const { result } = resp.body;
//         expect(result.username).toEqual(user.username);
//         expect(result.token).toBeDefined();
//         return done();
//       });
//     });
//   });
//   describe('/signin', () => {
//     it('should respond with created user', async (done) => {
//       request.post(`${endpoint}/signin`, {
//         form: {
//           ...user,
//         },
//       }, (error, resp) => {
//         if (error) {
//           return done(error);
//         }
//
//         expect(resp.statusCode).toEqual(200);
//         const { result } = resp.body;
//         console.log('Result In Jasmine***', resp);
//         expect(result.username).toEqual(user.username);
//         expect(result.token).toBeDefined();
//         return done();
//       });
//     });
//   });
// });
