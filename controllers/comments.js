// const fs = require('fs');

/**
 * POST a new comment
 */
function create(_req, res) {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
}

/**
 * GET all comments (most probably by user or post)
 */
function find(_req, res) {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
}

/**
 * GET comment by id
 */
function findById(_req, res) {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
}

/**
 * DELETE comment
 */
function destroy(_req, res) {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
}

/**
 * EDIT comment
 */
function edit(_req, res) {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
}

module.exports = {
  create,
  find,
  findById,
  edit,
  destroy,
};
