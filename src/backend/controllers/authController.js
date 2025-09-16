const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StellarSdk = require('@stellar/stellar-sdk');
const { Keypair, TransactionBuilder, Operation, Asset, Networks } = StellarSdk;
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
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const adminKeypair = Keypair.fromSecret(process.env.CHAVE_PRIVADA_ADMIN);

// --- Controller ---
exports.register = async (req, res) => {
  try {
    // Verificar se req.body existe e é um objeto
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body is missing or invalid' });
    }
    
    // Usar operador de coalescência nula para evitar erros de desestruturação
    const email = req.body.email || '';
    const password = req.body.password || '';
    const pix_key = req.body.pix_key || '';
    
    // Verificar se os campos obrigatórios estão presentes
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Simulação temporária para evitar erros com a API Stellar
    const pair = Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();
    
    console.log(`Simulando criação de conta ${publicKey} no Stellar Testnet...`);
    
    // Hash da senha e criptografia da chave secreta
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedSecretKey = encrypt(secretKey);
    
    // Criar usuário no banco de dados
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      stellar_public_key: publicKey,
      stellar_secret_key_encrypted: encryptedSecretKey,
      pix_key: pix_key ? encrypt(pix_key) : null
    });

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        stellar_public_key: user.stellar_public_key
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

exports.login = async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body is missing or invalid' });
  }
  
  const email = req.body.email || '';
  const password = req.body.password || '';
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        stellar_public_key: user.stellar_public_key
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};

// Export decrypt for other controllers
exports.decrypt = decrypt;
