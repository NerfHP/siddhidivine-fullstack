import express from 'express';
import { searchContent } from '../controllers/search.controller';

const router = express.Router();

router.get('/', searchContent);

export default router;
