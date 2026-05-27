import Session from '../models/Session.js';
import UserDetail from '../models/UserDetail.js';
import CommunicationRequest from '../models/CommunicationRequest.js';
import Transaction from '../models/Transaction.js';

const rates = { chat: 0.1, call: 0.5, videoCall: 1.0 };

export const startSession = async (req, res) => {
  try {
    const { communicationId } = req.body;

    const request = await CommunicationRequest.findById(communicationId).populate('user').populate('astrologer');
    if (!request || request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Invalid or unaccepted request' });
    }

    const rate = rates[request.type] || 0.1;
    const session = await Session.create({
      communicationId,
      user: request.user._id,
      astrologer: request.astrologer._id,
      type: request.type,
      ratePerSecond: rate,
    });

    return res.status(200).json({ success: true, message: 'Session started', session });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId).populate('user');
    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session already ended or invalid' });
    }

    const now = new Date();
    const seconds = Math.floor((now - new Date(session.startedAt)) / 1000);
    const charge = seconds * session.ratePerSecond;
    const user = session.user;

    if (user.wallet.balance < charge) {
      session.status = 'terminated';
    } else {
      session.status = 'completed';
      user.wallet.balance -= charge;
      await user.save();
      await Transaction.create({ userId: user._id, type: 'debit', amount: charge, reason: session.type });
    }

    session.endedAt = now;
    session.totalDuration = seconds;
    session.totalCharged = charge;
    await session.save();

    return res.status(200).json({ success: true, message: 'Session ended', session });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
