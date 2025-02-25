const express = require('express');
const router = express.Router();


module.exports = (controller) => {
  router.post('/registro', controller.registrar.bind(controller));

  router.post('/login', controller.login.bind(controller));

  router.get('/', controller.obtenerTodos.bind(controller));

  router.get('/:id', controller.obtenerPorId.bind(controller));

  router.put('/:id', controller.actualizar.bind(controller));

  router.delete('/:id', controller.eliminar.bind(controller));

  return router;
};