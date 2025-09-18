import express from 'express';
import { formController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware.js';
import { formValidation } from '../validation/index.js';

const router = express.Router();

router.post(
  '/contact',
  validate(formValidation.contact),
  formController.handleContactForm,
);

export default router;