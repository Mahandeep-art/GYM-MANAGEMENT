import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign(
        {
            admin_id: user.admin_id,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};