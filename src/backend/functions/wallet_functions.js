import * as StellarSdk from '@stellar/stellar-sdk';
import 'dotenv/config.js';

const { Horizon, Keypair, Asset, TransactionBuilder, Operation, Networks } = StellarSdk;

const ADMIN_PUBLIC = process.env.CHAVE_PUBLICA_ADMIN;

// Retorns the pair or throws an error
export async function createAndFundWallet() {
  const pair = Keypair.random();
  const publicKey = pair.publicKey();

  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    
    if (response.ok) {
      console.log('Conta criada e financiada com sucesso.');
      return pair; 
    } else {
      throw new Error('Failed to fund account via Friendbot.');
    }

  } catch (err) {
    throw err;
  }
}

// Creates a trustline to $CDRIVE for the user identified by UserSecret (a string)
export async function createTrustline(UserSecret) {
  // .env check
  if (!ADMIN_PUBLIC) {
    console.error('Erro: CHAVE_PUBLICA_ADMIN não definida no .env');
    process.exit(1);
  }
  if (!UserSecret) {
    console.error('Erro: UserSecret não fornecida');
    process.exit(1);
  }

  const horizonURL = 'https://horizon-testnet.stellar.org';

  const server = new Horizon.Server(horizonURL);

  // Key Setup
  const inventoryKeypair = Keypair.fromSecret(UserSecret);
  const inventoryPublic = inventoryKeypair.publicKey();

  // ADMIN_PUBLIC  é o emissor do ativo
  const asset = new Asset("CDRIVE", ADMIN_PUBLIC);

  try {
    const account = await server.loadAccount(inventoryPublic);
    const fee = await server.fetchBaseFee();

    const tx = new TransactionBuilder(account, {
      fee: fee.toString(), // Ensure fee is a string
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.changeTrust({ asset }))
      .setTimeout(60)
      .build();

    tx.sign(inventoryKeypair);

    await server.submitTransaction(tx);
    
    console.log('Trustline criada com sucesso.');
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('Erro do Horizon:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Erro:', err);
    }
    process.exit(1);
  }
}
