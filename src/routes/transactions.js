const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.post('/', async (req, res) => {
  try {
    const {
      amount,
      date,
      type,
      description,
      categoryId,
      subcategoryId
    } = req.body;

    // REQUIRED CHECK
    if (!amount || !date || !type || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // TEMP: replace with logged-in user id later
    const userId = req.user?.id || 1;

    // INSERT USING PRISMA
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        date: new Date(date),
        type,
        description,
        userId,
        categoryId,
        subcategoryId: subcategoryId || null
      }
    });

    res.status(201).json({
      message: 'Transaction stored',
      transaction
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
