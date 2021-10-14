
const express = require('express');
const sublistController = require('../controllers/sublistController');
const router = express.Router();

// List
router.get('/', sublistController.sublist_get);

// Details
router.get('/:id', sublistController.sublist_details_get);

// Create
router.post('/', sublistController.sublist_create);

// Update
router.patch('/:id', sublistController.sublist_update);

// Delete
router.delete('/:id', sublistController.sublist_delete);

module.exports = router;