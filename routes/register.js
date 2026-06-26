import express from 'express';
const router = express.Router();
import { handleNewUser } from '../controllers/registerController.js';

router.post('/', handleNewUser);

export default router;