import inquirer from 'inquirer';
import fs from 'fs';
import crypto from 'crypto';


const siteName = process.argv[3];
const algorithm = 'aes-256-cbc';
// Load or generate the encryption key and IV
let key, iv;

try {
    const keyData = JSON.parse(fs.readFileSync('key.json', 'utf8'));
    key = Buffer.from(keyData.key, 'hex');
    iv = Buffer.from(keyData.iv, 'hex');
} catch (err) {
    console.log('Generating new encryption key and IV...');
    key = crypto.randomBytes(32); // 256-bit key
    iv = crypto.randomBytes(16); // 128-bit IV
    fs.writeFileSync('key.json', JSON.stringify({ key: key.toString('hex'), iv: iv.toString('hex') }));
}

const questions = [
    { message: 'Name Of The Site', type: 'input', name: 'siteName' },
    { type: 'input', name: 'password', message: 'Password' },
    { type: 'input', name: 'email', message: 'Email/Username' },
];

function getFile(filename, site) {
    console.log(`Attempting to get current ${filename}....`);
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                console.error('Trouble Getting File....');
                reject(err);
            } else {
                console.log('Reading File....');
                try {
                    console.log(`Retrieving ${filename}....`);
                    const parsedData = JSON.parse(data.toString());
                    if (site === undefined) {
                        resolve(parsedData);
                    } else {
                        const siteEntry = parsedData.find(element => element.siteName === site);
                        resolve(siteEntry);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    reject(error);
                }
            }
        });
    });
}

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}

function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encrypted.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted.content, 'hex')), decipher.final()]);
    return decrypted.toString();
}

async function addToFile(data) {
    console.log('Adding To File....');
    try {
        const passwords = await getFile('passwords.json'); 
        const passwordsArray = passwords ? JSON.parse(passwords) : []; 
        if (typeof data !== 'object') {
            console.error('Received typeof: ' + typeof data);
            return;
        }

        // Encrypt the password before saving
        const encryptedPassword = encrypt(data.password);
        data.password = encryptedPassword;

        passwordsArray.push(data); // Add the new data to the array
        fs.writeFile('passwords.json', JSON.stringify(passwordsArray, null, 2), () => {
            console.log('Password Saved....');
        });
    } catch (err) {
        console.log('\x1b[31mError adding to file:', err + '\x1b[0m');
    }
}

async function getPassword(siteName) {
    console.log(`Retrieving password for site: ${siteName}....`);
    try {
        const passwords = await getFile('passwords.json'); 
        const passwordsArray = passwords ? JSON.parse(passwords) : [];

        // Find the entry for the given site name
        const siteEntry = passwordsArray.find(entry => entry.siteName === siteName);

        if (!siteEntry) {
            console.log('Site not found.');
            return;
        }

        // Decrypt the password
        const decryptedPassword = decrypt(siteEntry.password);
        console.log(`Password for ${siteName}: ${decryptedPassword}`);
    } catch (err) {
        console.error('\x1b[31mError retrieving password:', err + '\x1b[0m');
    }
}

async function updatePassword(siteName, newPassword) {
    try {
        console.log(`Updating password for site: ${siteName}`);

        // Retrieve the current data from passwords.json
        const passwords = await getFile('passwords.json');

        // Find the entry for the specified siteName
        const siteIndex = passwords.findIndex(entry => entry.siteName === siteName);
        if (siteIndex === -1) {
            console.log(`\x1b[31mSite ${siteName} not found.\x1b[0m`);
            return;
        }

        const encryptedPassword = encrypt(newPassword);

        passwords[siteIndex].password = encryptedPassword;

        fs.writeFile('passwords.json', JSON.stringify(passwords, null, 2), (err) => {
            if (err) {
                console.log('\x1b[31mError saving updated passwords:', err + '\x1b[0m');
            } else {
                console.log(`Password for ${siteName} updated successfully...`);
            }
        });
    } catch (error) {
        console.error('Error updating password:', error);
    }
}

function startPrompt() {
    inquirer.prompt(questions).then(value => {
        console.log('Received Input....');
        addToFile(value);
    }).catch(err => {
        console.log('Error:', err);
    });
}
switch (process.argv[2]?.toLowerCase()) {
    case 'add':
        startPrompt();
        break;
    case 'get':

        if (!siteName) {
            console.log('\x1b[31mPlease provide the site name to retrieve the password.\x1b[0m');
        } else {
            getPassword(siteName);
        }
        break;

    case 'update':
        if (!siteName){console.log('\x1b[31mPlease provide the site name to update the password.\x1b[0m')}
        else {
            const newPassword = process.argv[4];
            if (!newPassword) {
                console.log('\x1b[31mPlease provide the new password to update.\x1b[0m');
            } else {
                updatePassword(siteName, newPassword);
            }
        }
        break;
    default:
        console.log('\x1b[31mUsage: node index.js add | get <siteName> | update <siteName> <newPassword>\x1b[0m');
        break;
}
