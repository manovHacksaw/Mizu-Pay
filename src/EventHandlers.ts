import { MizuPay } from "../generated";

export const PaymentReceivedHandler = {
  event: "PaymentReceived",
  handler: async (event, ctx) => {
    const { payer, amount, currency, sessionId, timestamp } = event.params;
    
    // Store the payment transaction
    await ctx.db.Payment.create({
      data: {
        id: `${event.transaction.hash}-${event.logIndex}`,
        payer: payer.toLowerCase(),
        amount: amount.toString(),
        currency,
        sessionId,
        timestamp: Number(timestamp),
        blockNumber: event.block.number,
        transactionHash: event.transaction.hash,
        logIndex: event.logIndex,
        createdAt: new Date(),
      },
    });

    // Update user statistics
    const existingUser = await ctx.db.User.findUnique({
      where: { address: payer.toLowerCase() },
    });

    if (existingUser) {
      // Update existing user's total paid
      await ctx.db.User.update({
        where: { address: payer.toLowerCase() },
        data: {
          totalPaid: (BigInt(existingUser.totalPaid) + BigInt(amount)).toString(),
          paymentCount: existingUser.paymentCount + 1,
          lastPaymentAt: new Date(),
        });
    } else {
      // Create new user record
      await ctx.db.User.create({
        data: {
          address: payer.toLowerCase(),
          totalPaid: amount.toString(),
          paymentCount: 1,
          firstPaymentAt: new Date(),
          lastPaymentAt: new Date(),
        },
      });
    }

    // Update global statistics
    const globalStats = await ctx.db.GlobalStats.findUnique({
      where: { id: "main" },
    });

    if (globalStats) {
      await ctx.db.GlobalStats.update({
        where: { id: "main" },
        data: {
          totalPayments: globalStats.totalPayments + 1,
          totalVolume: (BigInt(globalStats.totalVolume) + BigInt(amount)).toString(),
          uniqueUsers: await ctx.db.User.count(),
        },
      });
    } else {
      await ctx.db.GlobalStats.create({
        data: {
          id: "main",
          totalPayments: 1,
          totalVolume: amount.toString(),
          uniqueUsers: 1,
        },
      });
    }
  },
};

export const WithdrawnHandler = {
  event: "Withdrawn",
  handler: async (event, ctx) => {
    const { to, amount, currency, timestamp } = event.params;
    
    // Store the withdrawal transaction
    await ctx.db.Withdrawal.create({
      data: {
        id: `${event.transaction.hash}-${event.logIndex}`,
        to: to.toLowerCase(),
        amount: amount.toString(),
        currency,
        timestamp: Number(timestamp),
        blockNumber: event.block.number,
        transactionHash: event.transaction.hash,
        logIndex: event.logIndex,
        createdAt: new Date(),
      },
    });
  },
};
