import CommunicationRequest from '../models/CommunicationRequest.js';
import UserDetail from '../models/UserDetail.js';
import Astrologer from '../models/Astrologer.js';


// ===============================
// 1. CREATE COMMUNICATION REQUEST
// ===============================
export const createCommunicationRequest = async (req, res) => {
  try {
    const { userId, astrologerId, type } = req.body;

    // ✅ Validate communication type
    if (!['chat', 'call', 'videoCall'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid communication type'
      });
    }

    // ✅ Check if user and astrologer exist (parallel DB calls for speed)
    const [user, astrologer] = await Promise.all([
      UserDetail.findById(userId),
      Astrologer.findById(astrologerId)
    ]);

    // ❌ If user or astrologer not found
    if (!user || !astrologer) {
      return res.status(404).json({
        success: false,
        message: 'User or Astrologer not found'
      });
    }

    // ✅ Create new communication request (store only IDs)
    const request = await CommunicationRequest.create({
      user: userId,
      astrologer: astrologerId,
      type
    });

    // ✅ Fetch created request with full user & astrologer details (populate)
    const populated = await CommunicationRequest.findById(request._id)
      .populate('user', 'name email mobileNo')
      .populate('astrologer', 'name email number');

    // ✅ Success response
    return res.status(201).json({
      success: true,
      message: `${type} request sent`,
      data: populated
    });

  } catch (err) {
    // ❌ Server error handling
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};


// ===============================
// 2. GET REQUESTS FOR ASTROLOGER
// ===============================
export const getRequestsForAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    // ✅ Find all requests for a specific astrologer
    const requests = await CommunicationRequest.find({ astrologer: astrologerId })
      // ✅ Only user basic info will be included
      .populate('user', 'name email profile')
      .sort({ createdAt: -1 }); // latest first

    // ✅ Response
    return res.status(200).json({
      success: true,
      data: requests
    });

  } catch (err) {
    // ❌ Error
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};


// ===============================
// 3. UPDATE REQUEST STATUS
// ===============================
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // ✅ Validate status
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // ✅ Update request status + return updated document
    const updated = await CommunicationRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    )
      .populate('user', 'name email mobileNo')
      .populate('astrologer', 'name email number');

    // ❌ If request not found
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated
    });

  } catch (err) {
    // ❌ Error handling
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};


// ===============================
// 4. GET REQUESTS FOR USER
// ===============================
export const getRequestsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Check if user exists
    const userExists = await UserDetail.findById(userId);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Get all communication history for user
    const requests = await CommunicationRequest.find({ user: userId })
      .populate('astrologer', 'name email number profile')
      .sort({ createdAt: -1 });

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: 'User communication history fetched',
      data: requests
    });

  } catch (err) {
    // ❌ Error handling
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};