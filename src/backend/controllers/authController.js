const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StellarSdk = require('@stellar/stellar-sdk');
const { Keypair } = StellarSdk;
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
const stellarConfig = require('../config/stellar');

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
    const name = req.body.name || '';
    const user_type = req.body.user_type || '';
    
    // Verificar se os campos obrigatórios estão presentes
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Criar conta Stellar usando a configuração centralizada
    let publicKey, secretKey;
    
    try {
      // Em produção, criar conta real na rede Stellar
      if (process.env.NODE_ENV === 'production') {
        const account = await stellarConfig.createStellarAccount();
        publicKey = account.publicKey;
        secretKey = account.secretKey;
      } else {
        // Em desenvolvimento, simular a criação da conta
        const pair = Keypair.random();
        publicKey = pair.publicKey();
        secretKey = pair.secret();
      }
      
      console.log(`Conta Stellar criada: ${publicKey}`);
    } catch (stellarError) {
      console.error('Erro ao criar conta Stellar:', stellarError);
      // Fallback para criação local em caso de erro
      const pair = Keypair.random();
      publicKey = pair.publicKey();
      secretKey = pair.secret();
      console.log(`Fallback: Conta Stellar simulada criada: ${publicKey}`);
    }
    
    // Hash da senha e criptografia da chave secreta
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedSecretKey = encrypt(secretKey);
    
    // Criar usuário no banco de dados
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      stellar_public_key: publicKey,
      stellar_secret_key_encrypted: encryptedSecretKey,
      pix_key: pix_key ? encrypt(pix_key) : null,
      name: name || null,
      user_type: user_type || null
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
        name: user.name,
        user_type: user.user_type,
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
      userType: user.user_type,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
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

// Buscar dados do perfil do usuário
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'user_type', 'pix_key']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Descriptografar chave PIX se existir
    let pixKey = null;
    if (user.pix_key) {
      try {
        pixKey = decrypt(user.pix_key);
      } catch (error) {
        console.error('Erro ao descriptografar chave PIX:', error);
      }
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      user_type: user.user_type,
      pix_key: pixKey
    });
    
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Atualizar dados do perfil do usuário
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, pix_key } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Preparar dados para atualização
    const updateData = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (pix_key !== undefined) {
      updateData.pix_key = pix_key ? encrypt(pix_key) : null;
    }
    
    // Atualizar usuário
    await user.update(updateData);
    
    // Retornar dados atualizados (sem dados sensíveis)
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'user_type', 'pix_key']
    });
    
    // Descriptografar chave PIX para retorno
    let pixKey = null;
    if (updatedUser.pix_key) {
      try {
        pixKey = decrypt(updatedUser.pix_key);
      } catch (error) {
        console.error('Erro ao descriptografar chave PIX:', error);
      }
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        user_type: updatedUser.user_type,
        pix_key: pixKey
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
