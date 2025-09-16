import { Keypair, Contract, SorobanRpc, TransactionBuilder, Networks, BASE_FEE, nativeToScVal, Address, scValToNative } from '@stellar/stellar-sdk';
import 'dotenv/config.js';

const CONTRACT_ID = process.env.CONTRACT_ID;
const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new SorobanRpc.Server(RPC_URL);

// Retorna o par ou lança erro
export async function createAndFundWallet() {
  const pair = Keypair.random();
  const publicKey = pair.publicKey();

  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    
    if (response.ok) {
      console.log('Conta criada e financiada com sucesso.');
      return {
        keypair: pair,
        publicKey: pair.publicKey(),
        secret: pair.secret()
      };
    } else {
      throw new Error('Failed to fund account via Friendbot.');
    }

  } catch (err) {
    throw err;
  }
}

// Consulta o saldo de tokens do contrato Soroban
export async function getBalance(account) {
  try {
    const contract = new Contract(CONTRACT_ID);

    // Conta dummy para simulação
    const dummyAccount = await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');

    const balanceOp = contract.call(
      'balance',
      nativeToScVal(Address.fromString(account), { type: 'address' })
    );

    const transaction = new TransactionBuilder(dummyAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(balanceOp)
      .setTimeout(30)
      .build();

    // Simula para obter o resultado
    const simResult = await server.simulateTransaction(transaction);

    console.log('Resultado da simulação:', simResult);

    if (simResult.result && simResult.result.retval) {
      try {
        const balance = scValToNative(simResult.result.retval);
        const humanReadableBalance = Number(balance) / (10 ** 7);
        return humanReadableBalance.toString();
      } catch (err) {
        console.error('Erro ao converter saldo:', err);
        return "0";
      }
    }

    return "0";
  } catch (error) {
    console.error('Erro ao consultar saldo:', error);
    throw error;
  }
}