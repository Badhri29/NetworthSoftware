const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// CREATE TRANSACTION
router.post('/', async (req, res) => {
  try {
    const {
      date,
      type,
      category,
      subcategory,
      details,
      amount,
      paymentMode,
      card
    } = req.body;

    console.log('Received transaction data:', req.body);

    // Validate required fields
    if (!date || !type || !amount || !paymentMode) {
      console.log('Missing required fields:', { date, type, amount, paymentMode });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, type, amount, and paymentMode are required'
      });
    }

    // Create transaction using Prisma
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        type,
        category,
        subcategory: subcategory || null,
        description: details || null,
        amount: parseFloat(amount),
        paymentMode,
        card: paymentMode === 'credit' ? card : null
      }
    });

    console.log('Transaction created:', transaction);

    res.status(201).json({
      success: true,
      message: 'Transaction stored successfully',
      data: transaction
    });

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
});

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = router;
