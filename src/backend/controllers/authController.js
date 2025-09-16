
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StellarSdk = require('stellar-sdk');
const { Server, Keypair, TransactionBuilder, Operation, Asset } = require('@stellar/stellar-sdk'); // Use the new package and destructure classes directly
const User = require('../models/user');
const crypto = require('crypto');

// --- Encryption Utility ---
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY = crypto.createHash('sha512').update(process.env.ENCRYPTION_KEY).digest('base64').substr(0, 32);

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
}

function decrypt(encryptedData) {
  const bData = Buffer.from(String(encryptedData), 'hex');
  const salt = bData.slice(0, SALT_LENGTH);
  const iv = bData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = bData.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = bData.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

// --- Stellar Configuration ---
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const adminKeypair = Keypair.fromSecret(process.env.CHAVE_PRIVADA_ADMIN);

// --- Controller ---

exports.register = async (req, res) => {
  const { email, password, pix_key } = req.body;

  try {
    // 1. Generate Stellar Keypair
    const pair = Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();

    // 2. Create Account on Stellar
    console.log(`Activating account ${publicKey} on Stellar Testnet...`);
    const adminAccount = await server.loadAccount(adminKeypair.publicKey());
    const transaction = new TransactionBuilder(adminAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: 'Test SDF Network ; September 2015',
    })
      .addOperation(Operation.createAccount({
        destination: publicKey,
        startingBalance: '1.5' // Starting balance in XLM
      }))
      .build();
    transaction.sign(adminKeypair);
    await server.submitTransaction(transaction);

    // 3. Create Trustline for $CDRIVE
    console.log(`Creating trustline for $CDRIVE for account ${publicKey}...`);
    const newAccount = await server.loadAccount(publicKey);
    const asset = new Asset('CDRIVE', process.env.CDRIVE_ASSET_ISSUER);
    const trustTransaction = new TransactionBuilder(newAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: 'Test SDF Network ; September 2015',
    })
        .addOperation(Operation.changeTrust({ asset }))
        .build();
    trustTransaction.sign(Keypair.fromSecret(secretKey));
    await server.submitTransaction(trustTransaction);

    // 4. Encrypt Secret Key and Hash Password
    const encryptedSecretKey = encrypt(secretKey);
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Save User to DB
    const user = await User.create({
      email,
      password_hash: passwordHash,
      pix_key,
      stellar_public_key: publicKey,
      stellar_secret_key_encrypted: encryptedSecretKey,
    });

    // 6. Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};

// Export decrypt for other controllers
exports.decrypt = decrypt;
