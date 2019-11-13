const uuid = require('uuid/v1');

const { query } = require('../../db');

const findById = (id) => new Promise((resolve, reject) => {
  const findQuery = 'SELECT c.id, c.name, c.created_at, c.updated_at, u.id as '
    + 'u_id, u.username FROM categories c JOIN users u ON (u.id=c.user_id) '
    + 'WHERE (c.id=$1) LIMIT 1';
  query(findQuery, [id], (err, resp) => {
    if (err) {
      return reject(err);
    }
    const [category] = resp.rows;
    if (!category) {
      return resolve(null);
    }

    const {
      u_id: userId, username, created_at: createdAt, updated_at: updatedAt,
      ...rest
    } = category;
    return resolve({
      ...rest,
      user: { id: userId, username },
      createdAt,
      updatedAt,
    });
  });
});

const find = async () => {
  const findQuery = 'SELECT id FROM categories';
  const { rows: [categories] } = await query(findQuery);
  return categories.map((cat) => findById(cat.id));
};

const create = async ({ name, userId }) => {
  const categoryId = uuid();
  const createQuery = 'INSERT INTO categories(id, name, user_id) '
  + 'VALUES($1,$2,$3)';
  const categoryValues = [categoryId, name, userId];
  await query(createQuery, categoryValues);
  const newCategory = await findById(categoryId);
  return newCategory;
};

const update = async ({ id, name }) => {
  const updateQuery = 'UPDATE categories SET name=$1 WHERE (id=$2)';
  await query(updateQuery, [name, id]);

  return findById(id);
};

// const destory = async (id) => {
//   const destoryQuery = 'DELETE FROM categories WHERE (id=$1)';
//   await query(destoryQuery, id);
//   return true;
// };

module.exports = {
  findById,
  find,
  create,
  update,
  // destory,
};
