import express from 'express';
import { searchContent } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', searchContent);

export default router;
