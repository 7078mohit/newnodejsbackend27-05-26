import mongoose from 'mongoose';
import PrivateChat from '../models/PrivateChat.js';
import UserDetail from '../models/UserDetail.js';
import Astrologer from '../models/Astrologer.js';
import createChatHash from '../utils/chatHash.js';
import { chargeUserUsage } from '../utils/billing.js';



/* ==========================
   SEND MESSAGE
========================== */
export const sendMessage = async (req, res) => {
    try {
        const { userId, astrologerId, senderId, senderType, message } = req.body;

        if (!message || !String(message).trim()) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const astrologer = await Astrologer.findById(astrologerId).select("chatFee perMinuteRate");

        if (!astrologer) {
            return res.status(404).json({ success: false, message: "Astrologer not found" });
        }

        if (senderType === "user") {
            const charge = await chargeUserUsage({
                userId,
                astrologerId,
                serviceType: "chat",
                minutes: 1,
                allowPartial: false,
            });

            if (!charge.ok) {
                return res.status(402).json({
                    success: false,
                    message: "Insufficient balance. Please recharge wallet.",
                    data: charge,
                });
            }
        }

        const chatId = createChatHash(userId, astrologerId);

        const saved = await PrivateChat.create({
            chatId,
            senderId,
            receiverId: senderType === "user" ? astrologerId : userId,
            message,
            senderType,
        });

        return res.json({ success: true, data: saved });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
};



/* ==========================
   GET CHAT HISTORY
========================== */
export const getChatHistory = async (req, res) => {
    try {
        const { userId, astroId } = req.params;

        const chatId = createChatHash(userId, astroId);

        const chats = await PrivateChat.find({ chatId }).sort({ createdAt: 1 });

        return res.json(chats);
    } catch (err) {
        return res.status(500).json({ message: "Error loading chat" });
    }
};


/* ==========================
   ASTROLOGER CHAT THREADS
========================== */
export const getAstrologerThreads = async (req, res) => {
    try {
        const { astrologerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
            return res.status(400).json({ message: "Invalid astrologerId" });
        }

        const astroObjectId = new mongoose.Types.ObjectId(astrologerId);

        const messages = await PrivateChat.find({
            $or: [{ senderId: astroObjectId }, { receiverId: astroObjectId }],
        }).sort({ createdAt: -1 });

        const threadMap = new Map();

        for (const msg of messages) {
            const senderId = String(msg.senderId);
            const receiverId = String(msg.receiverId);
            const astroId = String(astrologerId);

            const userId = senderId === astroId ? receiverId : senderId;

            if (!threadMap.has(userId)) {
                threadMap.set(userId, {
                    userId,
                    chatId: msg.chatId,
                    lastMessage: msg.message,
                    lastMessageAt: msg.createdAt,
                });
            }
        }

        const userIds = [...threadMap.keys()]
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id));

        const users = await UserDetail.find({ _id: { $in: userIds } })
            .select("name profile mobileNo");

        const userMap = new Map(users.map((u) => [String(u._id), u]));

        const threads = [...threadMap.values()].map((thread) => {
            const user = userMap.get(thread.userId);

            return {
                ...thread,
                userName: user?.name || "User",
                userProfile: user?.profile || null,
                userMobile: user?.mobileNo || null,
            };
        });

        return res.json({ success: true, data: threads });
    } catch (err) {
        return res.status(500).json({ message: "Error loading astrologer threads" });
    }
};

