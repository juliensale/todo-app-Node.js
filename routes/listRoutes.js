const express = require('express');
const listController = require('../controllers/listController');
const router = express.Router();

// List
router.get('/', listController.list_get);

// Details
router.get('/:id', listController.list_details_get);

// Create
router.post('/', listController.list_create);

// Update
router.patch('/:id', listController.list_update);

// Delete
router.delete('/:id', listController.list_delete);

//Login
module.exports = router;