import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
    res.status(400).send("Backend running....");
});


export default router;
