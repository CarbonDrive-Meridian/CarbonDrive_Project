import {
  Keypair,
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address
} from '@stellar/stellar-sdk';
import 'dotenv/config.js';

const CONTRACT_ID = process.env.CONTRACT_ID;
const PRIVATE_KEY = process.env.CHAVE_PRIVADA_ADMIN;

const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new SorobanRpc.Server(RPC_URL);

export async function mintToken(account, amount, secret = PRIVATE_KEY) {
  try {
    const minterKeypair = Keypair.fromSecret(secret);
    const contract = new Contract(CONTRACT_ID);

    const minterAccount = await server.getAccount(minterKeypair.publicKey());

    // Considerando 18 casas decimais
    const amountInSmallestUnit = BigInt(amount) * BigInt(10 ** 7);

    const mintOp = contract.call(
      'mint',
      nativeToScVal(Address.fromString(account), { type: 'address' }),
      nativeToScVal(amountInSmallestUnit, { type: 'i128' })
    );

    const transaction = new TransactionBuilder(minterAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(mintOp)
      .setTimeout(30)
      .build();

    const preparedTx = await server.prepareTransaction(transaction);
    preparedTx.sign(minterKeypair);

    const result = await server.sendTransaction(preparedTx);

    return result;
  } catch (error) {
    console.error('Erro ao mintar token:', error);
    throw error;
  }
}

// Example usage:
// mintTokens("GABC...USER", 1000)
//   .then(console.log).catch(console.error);