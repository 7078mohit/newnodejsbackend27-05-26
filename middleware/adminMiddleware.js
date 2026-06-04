import Admin from '../models/Admin.js';

export const adminMiddleware = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id);
// console.log(req.user.id)
        if (!admin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access only'
            });
        }

        req.admin = admin;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};