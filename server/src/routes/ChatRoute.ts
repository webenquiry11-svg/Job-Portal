import express from 'express';
import { getMessages, sendMessage, markAsSeen, getConversations } from '../controllers/ChatController';

const router = express.Router();

router.get('/conversations/:userId', getConversations);
router.get('/:user1/:user2', getMessages);
router.post('/send', sendMessage);
router.post('/seen', markAsSeen);

export default router;