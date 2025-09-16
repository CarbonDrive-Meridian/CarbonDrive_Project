const User = require('../models/user');
const { decrypt } = require('./authController'); // Re-using decrypt function
const { Keypair, Asset, Operation, Server, TransactionBuilder } = require('stellar-sdk');

// --- Stellar Configuration ---
const server = new Server('https://horizon-testnet.stellar.org');

exports.ecoConducao = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const amount = 1.5; // Simulated amount

    console.log(`SIMULATION: User ${user.email} generated ${amount} $CDRIVE.`);

    // SIMULATION of Soroban mint call
    console.log(`SIMULATION: Calling Soroban contract to mint ${amount} $CDRIVE for ${user.stellar_public_key}`);
    // In a real scenario, you would use soroban-client or a similar library
    // to call the mint function of your smart contract, signing with the platform's admin key.
    // Example:
    const contract = new SorobanClient.Contract(process.env.SOROBAN_CONTRACT_ID);
    // const tx = await contract.methods.mint({ to: user.stellar_public_key, amount: amount * 1e7 }).sign(adminKeypair).submit();

    res.status(200).json({ message: `Successfully generated ${amount} $CDRIVE.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate eco-driving credits', details: error.message });
  }
};

exports.trocarCdrPorPix = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const amountToSwap = 5; // Example amount of $CDRIVE to swap
    const brlValue = amountToSwap * 0.8; // Simulated quotation: 1 $CDRIVE = R$0.80

    // Decrypt user's secret key
    const userSecretKey = decrypt(user.stellar_secret_key_encrypted);
    const userKeypair = Keypair.fromSecret(userSecretKey);

    // SIMULATION of Stellar Transaction (moving $CDRIVE to platform)
    console.log(`Moving ${amountToSwap} $CDRIVE from ${user.stellar_public_key} to platform inventory account.`);
    const sourceAccount = await server.loadAccount(userKeypair.publicKey());
    const asset = new Asset('CDRIVE', process.env.CDRIVE_ASSET_ISSUER);
    const transaction = new TransactionBuilder(sourceAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: 'Test SDF Network ; September 2015',
    })
      .addOperation(Operation.payment({
        destination: process.env.CHAVE_PUBLICA_INVENTARIO,
        asset: asset,
        amount: String(amountToSwap)
      }))
      .build();
    transaction.sign(userKeypair);
    await server.submitTransaction(transaction);

    // PIX Payment (PLAN A - MVP)
    console.log(`SIMULATION: PIX payment of R$${brlValue.toFixed(2)} to key ${user.pix_key}.`);

    // PLAN B - Real Stripe Integration
    const stripe = require('stripe')(process.env.STRIPE_ACCESS_TOKEN);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(brlValue * 100), // O valor deve ser em centavos
      currency: 'brl',
      description: `Swap of ${amountToSwap} $CDRIVE`,
      payment_method_types: ['pix'],
      receipt_email: user.email,
    });
    console.log('Stripe Payment Intent created:', paymentIntent);

    res.status(200).json({ message: `Swap of ${amountToSwap} $CDRIVE for R$${brlValue.toFixed(2)} initiated.` });

  } catch (error) {
    res.status(500).json({ error: 'Failed to swap $CDRIVE for PIX', details: error.message });
  }
};