const express = require('express');
const router = express.Router();

module.exports = (controller) => {
  router.post('/registro', controller.registrar.bind(controller));
  return router;
};