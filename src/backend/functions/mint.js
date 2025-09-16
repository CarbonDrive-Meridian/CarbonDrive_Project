const { SorobanRpc, Contract, TransactionBuilder, Networks, Keypair, Address, nativeToScVal } = require('@stellar/stellar-sdk');
require('dotenv/config');

const ADMIN_SECRET = process.env.CHAVE_PRIVADA_ADMIN;
const CONTRACT_ID = process.env.CONTRACT_ID;

export async function mintToken(userPublicKey, amount) {
    const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
    const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);
    
    try {
        const account = await server.getAccount(adminKeypair.publicKey());
        const contract = new Contract(CONTRACT_ID);

        // Convert userPublicKey string to an ScVal Address object
        const destinationAddress = new Address(userPublicKey).toScVal();

        // Convert number to an ScVal UnsignedHyper (U64) object
        const scvalAmount = nativeToScVal(BigInt(amount), { type: 'i128' });

        // Build the mint operation
        const mintOp = contract.call(
            'mint',
            destinationAddress,
            scvalAmount
        );
        
        const tx = new TransactionBuilder(account, {
            // Arbitrary fee value
            fee: "100",
            networkPassphrase: Networks.TESTNET,
        })
        .addOperation(mintOp)
        .setTimeout(30)
        .build();
        
        // Prepare and sign transaction
        const preparedTx = await server.prepareTransaction(tx);
        preparedTx.sign(adminKeypair);
        
        // Submit
        const result = await server.sendTransaction(preparedTx);
        console.log('Minting successful:', result);
    } catch (err) {
        console.error('Minting failed:', err);
        throw err;
    }
}