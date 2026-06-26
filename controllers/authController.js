import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

export const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;

    if (!user || !pwd) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const foundUser = await User.findOne({ username: user }).exec();
        if (!foundUser) return res.sendStatus(401);

        const match = await bcrypt.compare(pwd, foundUser.password);
        if (!match) return res.sendStatus(401);

        const roles = foundUser.roles ? Object.values(foundUser.roles) : [];
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username,
                    roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        const cookieOptions = {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
        };

        res.cookie('jwt', refreshToken, cookieOptions);
        res.json({ accessToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};