import jwt from 'jsonwebtoken';
import User from '../model/User.js';

export const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    try {
        const foundUser = await User.findOne({ refreshToken }).exec();
        if (!foundUser) return res.sendStatus(403);

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err || !decoded?.username || foundUser.username !== decoded.username) {
                    return res.sendStatus(403);
                }

                const roles = foundUser.roles ? Object.values(foundUser.roles) : [];
                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            username: decoded.username,
                            roles,
                        },
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '30s' }
                );

                res.json({ accessToken });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};