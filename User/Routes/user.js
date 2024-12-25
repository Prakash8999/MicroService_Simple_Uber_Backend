import express from 'express';
import { acceptedRide, createUser, getUser, login } from '../Controllers/UserCtrl.js';
import { userAuth } from '../middleware/authMiddleWare.js';
const router = express.Router()

router.post('/register',createUser)
router.post('/login',login)
router.get('/profile',userAuth, getUser)

router.get('/accepted-ride', userAuth, acceptedRide)
export default router;