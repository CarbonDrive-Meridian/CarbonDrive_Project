import { SorobanRpc, Contract, TransactionBuilder, Networks, Keypair, Address, nativeToScVal } from '@stellar/stellar-sdk';
import 'dotenv/config.js';

const ADMIN_PUBLIC = process.env.CHAVE_PUBLICA_ADMIN;
const CONTRACT_ID = process.env.CONTRACT_ID;

export async function getTokenFromUser(userPrivateKey, amount) {
    const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
    const userKeypair = Keypair.fromSecret(userPrivateKey);
    amount = amount * (10 ** 7); // Ajusta para a menor unidade

    try {
        const account = await server.getAccount(userKeypair.publicKey());
        const contract = new Contract(CONTRACT_ID);

        // Address do remetente e do destinatário
        const fromAddress = new Address(userKeypair.publicKey()).toScVal();
        const toAddress = new Address(ADMIN_PUBLIC).toScVal();

        // Amount como i128
        const scvalAmount = nativeToScVal(BigInt(amount), { type: 'i128' });

        // Build the transfer operation
        const transferOp = contract.call(
            'transfer',
            fromAddress,
            toAddress,
            scvalAmount
        );

        const tx = new TransactionBuilder(account, {
            fee: "100", // fee mínima em stroops
            networkPassphrase: Networks.TESTNET,
        })
        .addOperation(transferOp)
        .setTimeout(30)
        .build();

        // Prepare and sign transaction
        const preparedTx = await server.prepareTransaction(tx);
        preparedTx.sign(userKeypair);

        // Submit
        const result = await server.sendTransaction(preparedTx);
        console.log('Transfer successful:', result);
    } catch (err) {
        console.error('Transfer failed:', err);
        throw err;
    }
}
