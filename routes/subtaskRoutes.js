
const express = require('express');
const subtaskController = require('../controllers/subtaskController');
const router = express.Router();

// List
router.get('/', subtaskController.subtask_get);

// Details
router.get('/:id', subtaskController.subtask_details_get);

// Create
router.post('/', subtaskController.subtask_create);

// Update
router.patch('/:id', subtaskController.subtask_update);

// Delete
router.delete('/:id', subtaskController.subtask_delete);

// Complete
router.post('/:id/complete', subtaskController.subtask_complete);

// Uncomplete
router.post('/:id/uncomplete', subtaskController.subtask_uncomplete);

module.exports = router;