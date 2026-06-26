import fs from 'fs';

const rs = fs.createReadStream('./files/lorem.txt', { encoding: 'utf-8' })

const ws = fs.createWriteStream('./files/newLorem.txt')

// rs.on('data', (chunk) => {
//     ws.write(chunk)
// })

rs.pipe(ws) 