import usersData from '../model/users.json' with { type: 'json' };
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersDB = {
    users: usersData,
    setUsers: function (data) { this.users = data }
}

export const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        const cookieOptions = { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', secure: process.env.NODE_ENV === 'production' };
        res.clearCookie('jwt', cookieOptions);
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    const currentUser = { ...foundUser, refreshToken: '' };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(usersDB.users)
    );

    const cookieOptions = { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', secure: process.env.NODE_ENV === 'production' };
    res.clearCookie('jwt', cookieOptions);
    res.sendStatus(204);
}