import express from 'express';
import { createUser, getUser, login, updateAvailability, WaitForNewRide } from '../Controllers/CaptainCtrl.js';
import { userAuth } from '../middleware/authMiddleWare.js';
const router = express.Router()

router.post('/register',createUser)
router.post('/login',login)
router.get('/profile',userAuth, getUser)
router.patch('/update-availability',userAuth, updateAvailability)
router.get('/wait-new-ride', userAuth, WaitForNewRide)

export default router;