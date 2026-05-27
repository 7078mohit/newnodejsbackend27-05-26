import cron from 'node-cron';
import Session from '../models/Session.js';
import UserDetail from '../models/UserDetail.js';
import Transaction from '../models/Transaction.js';

// Runs every second — deducts exactly 1 second of charge per active session tick
cron.schedule('* * * * * *', async () => {
  try {
    const activeSessions = await Session.find({ status: 'active' });

    for (const session of activeSessions) {
      try {
        const now = new Date();

        if (session.lastChargedAt) {
          const msSinceLastCharge = now - new Date(session.lastChargedAt);
          if (msSinceLastCharge < 900) continue;
        }

        const chargeThisTick = session.ratePerSecond || 0;
        if (chargeThisTick <= 0) continue;

        const user = await UserDetail.findById(session.user);
        if (!user) {
          session.status = 'terminated';
          session.endedAt = now;
          await session.save();
          continue;
        }

        const currentBalance = user.wallet?.balance ?? 0;

        if (currentBalance < chargeThisTick) {
          session.status = 'terminated';
          session.endedAt = now;
          session.totalDuration = Math.floor((now - new Date(session.startedAt)) / 1000);
          await session.save();
        } else {
          user.wallet.balance = parseFloat((currentBalance - chargeThisTick).toFixed(2));
          await user.save();

          await Transaction.create({
            userId: user._id,
            type: 'debit',
            amount: chargeThisTick,
            reason: session.type,
          });

          session.totalDuration = Math.floor((now - new Date(session.startedAt)) / 1000);
          session.totalCharged = parseFloat(((session.totalCharged || 0) + chargeThisTick).toFixed(2));
          session.lastChargedAt = now;
          await session.save();
        }
      } catch (sessionErr) {
        console.error(`[walletCron] Error processing session ${session._id}:`, sessionErr.message);
      }
    }
  } catch (err) {
    console.error('[walletCron] Failed to fetch active sessions:', err.message);
  }
});
