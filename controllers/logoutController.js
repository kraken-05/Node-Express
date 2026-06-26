import User from '../model/User.js';

export const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    try {
        const foundUser = await User.findOne({ refreshToken }).exec();
        if (!foundUser) {
            const cookieOptions = {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                secure: process.env.NODE_ENV === 'production',
            };
            res.clearCookie('jwt', cookieOptions);
            return res.sendStatus(204);
        }

        foundUser.refreshToken = '';
        await foundUser.save();

        const cookieOptions = {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            secure: process.env.NODE_ENV === 'production',
        };
        res.clearCookie('jwt', cookieOptions);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};