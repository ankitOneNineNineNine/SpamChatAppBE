const router = require('express').Router();
const authenticate = require('./middlewares/authenticate.middleware');
const authRouter =require('./routes/auth');
const userRouter = require('./routes/user')

router.use('/auth', authRouter );
router.use('/user', authenticate, userRouter)

module.exports = router;