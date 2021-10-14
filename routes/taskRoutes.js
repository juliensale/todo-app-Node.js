
const express = require('express');
const taskController = require('../controllers/taskController');
const router = express.Router();

// List
router.get('/', taskController.task_get);

// Details
router.get('/:id', taskController.task_details_get);

// Create
router.post('/', taskController.task_create);

// Update
router.patch('/:id', taskController.task_update);

// Delete
router.delete('/:id', taskController.task_delete);

module.exports = router;