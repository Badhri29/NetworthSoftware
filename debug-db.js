const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n=== DATABASE DEBUG ===\n');
    
    // Check users
    const users = await prisma.user.findMany({ 
      select: { id: true, email: true, createdAt: true } 
    });
    console.log('Total users:', users.length);
    console.log('Users:', users);
    
    if (users.length > 0) {
      const userId = users[0].id;
      const email = users[0].email;
      
      // Check assets
      const assets = await prisma.asset.findMany({ 
        where: { userId },
        select: { id: true, name: true, type: true, value: true }
      });
      console.log(`\nAssets for ${email}:`, assets.length);
      console.log(assets);
      
      // Check liabilities
      const liabilities = await prisma.liability.findMany({ 
        where: { userId },
        select: { id: true, name: true, type: true, value: true }
      });
      console.log(`\nLiabilities for ${email}:`, liabilities.length);
      console.log(liabilities);
      
      // Check transactions
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        select: { id: true, type: true, amount: true }
      });
      console.log(`\nTransactions for ${email}:`, transactions.length);
      if (transactions.length > 0) {
        const incomeTotal = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expenseTotal = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount || 0), 0);
        console.log(`Income total: ₹${incomeTotal}, Expense total: ₹${expenseTotal}`);
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
