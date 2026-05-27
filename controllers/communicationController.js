import CommunicationRequest from '../models/CommunicationRequest.js';
import UserDetail from '../models/UserDetail.js';
import Astrologer from '../models/Astrologer.js';

export const requestCommunication = async (req, res) => {
  try {
    const { userId, astrologerId, type } = req.body;

    if (!['chat', 'call', 'videoCall'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid communication type' });
    }

    const [user, astrologer] = await Promise.all([UserDetail.findById(userId), Astrologer.findById(astrologerId)]);
    if (!user || !astrologer) return res.status(404).json({ success: false, message: 'User or Astrologer not found' });

    const request = await CommunicationRequest.create({ user: userId, astrologer: astrologerId, type });
    const populated = await CommunicationRequest.findById(request._id).populate('user', 'name email mobileNo').populate('astrologer', 'name email number');

    return res.status(201).json({ success: true, message: `${type} request sent`, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getRequestsForAstrologer = async (req, res) => {
  try {
    const requests = await CommunicationRequest.find({ astrologer: req.params.astrologerId })
      .populate('user', 'name email profile')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updated = await CommunicationRequest.findByIdAndUpdate(requestId, { status }, { new: true })
      .populate('user', 'name email mobileNo')
      .populate('astrologer', 'name email number');

    if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
    return res.status(200).json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getRequestsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userExists = await UserDetail.findById(userId);
    if (!userExists) return res.status(404).json({ success: false, message: 'User not found' });

    const requests = await CommunicationRequest.find({ user: userId })
      .populate('astrologer', 'name email number profile')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: 'User communication history fetched', data: requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
