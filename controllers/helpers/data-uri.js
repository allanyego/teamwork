const Datauri = require('datauri');
const path = require('path');

const dUri = new Datauri();

/**
* @description This function converts the buffer to data url
* @param {Object} req containing the field object
* @returns {String} The data url from the string buffer
*/
const dataUri = (req) => dUri.format(path.extname(req.file.originalname)
  .toString(), req.file.buffer);

module.exports = {
  dataUri,
};
