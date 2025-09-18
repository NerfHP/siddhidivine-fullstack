import express from 'express';
import { formController } from '../controllers/index.js';
import { validate } from '../middleware/validate.middleware';
import { formValidation } from '../validation';

const router = express.Router();

router.post(
  '/contact',
  validate(formValidation.contact),
  formController.handleContactForm,
);

export default router;