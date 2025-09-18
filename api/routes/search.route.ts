import express from 'express';
import { searchContent } from '../controllers/index.js/search.controller';

const router = express.Router();

router.get('/', searchContent);

export default router;
