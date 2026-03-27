import express from 'express';
import { getMessages, sendMessage } from '../controllers/ChatController';

const router = express.Router();

router.get('/:user1/:user2', getMessages);
router.post('/send', sendMessage);

export default router;