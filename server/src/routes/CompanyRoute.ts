import express from 'express';
import { getCompanyById } from '../controllers/CompanyController';

const router = express.Router();

router.get('/:id', getCompanyById);

export default router;