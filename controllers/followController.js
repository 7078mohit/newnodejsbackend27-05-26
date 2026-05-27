import mongoose from 'mongoose';
import FollowAstrologer from '../models/FollowAstrologer.js';
import UserDetail from '../models/UserDetail.js';
import Astrologer from '../models/Astrologer.js';

export const followUnfollowAstrologer = async (req, res) => {
  try {
    const { userId, astrologerId } = req.body;

    const [user, astro] = await Promise.all([UserDetail.findById(userId), Astrologer.findById(astrologerId)]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!astro) return res.status(404).json({ message: 'Astrologer not found' });

    const astroObjId = new mongoose.Types.ObjectId(astrologerId);
    const isAlreadyFollowing = user.following.some((id) => id.toString() === astrologerId);

    if (!isAlreadyFollowing) {
      user.following.push(astroObjId);
      await user.save();
      await FollowAstrologer.create({ userId: user._id, astrologerId: astro._id, isFollowed: true });
      return res.status(200).json({ success: true, message: 'Astrologer followed', following: user.following });
    } else {
      user.following = user.following.filter((id) => id.toString() !== astrologerId);
      await user.save();
      await FollowAstrologer.findOneAndDelete({ userId: user._id, astrologerId: astro._id });
      return res.status(200).json({ success: true, message: 'Astrologer unfollowed', following: user.following });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
