const User = require('../models/user');
const { decrypt } = require('./authController');
const { Server, Keypair, Asset, Operation, TransactionBuilder, SorobanRpc, Networks } = require('stellar-sdk');
import StellarSdk from 'stellar-sdk';
const { Contract } = require('@stellar/stellar-sdk');

// --- Stellar e Soroban Configuration ---
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const contractId = process.env.SOROBAN_CONTRACT_ID;
const adminKeypair = Keypair.fromSecret(process.env.PLATFORM_ADMIN_SECRET);

exports.ecoConducao = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const amount = 1.5; // Valor real a ser gerado
    const recipient = user.stellar_public_key;

    // --- Interação REAL com o Contrato Soroban ---
    const contract = new Contract(contractId);
    
    // Constrói a chamada para a função 'mint' do contrato.
    const mintTx = await contract.mint({ to: recipient, amount: BigInt(amount * 1e7) });

    // Prepara a transação com a rede.
    const preparedTransaction = await sorobanServer.prepareTransaction(mintTx, {
      account: adminKeypair.publicKey(),
      horizon: horizonServer,
    });
    
    // Assina a transação com a chave do administrador.
    preparedTransaction.sign(adminKeypair);

    // Envia a transação para a rede Stellar.
    const sendResult = await sorobanServer.sendTransaction(preparedTransaction);

    // Espera pelo resultado da transação.
    const result = await sorobanServer.getTransaction(sendResult.hash);

    if (result.status === 'SUCCESS') {
      res.status(200).json({ message: `Successfully minted ${amount} $CDRIVE.` });
    } else {
      throw new Error(`Transaction failed with status: ${result.status}`);
    }

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate eco-driving credits', details: error.message });
  }
};

//Para a segunda parte do seu código, a função `trocarCdrPorPix`, a refatoração é mais complexa.

// //Refatorando a Função `trocarCdrPorPix`

// A função `trocarCdrPorPix` tem duas partes que precisam ser substituídas: a transação Stellar de teste para uma real e a integração simulada do Pix.

// 1.  **Transação Stellar (real):** A sua simulação já estava bem próxima do que é uma transação real, mas algumas bibliotecas estão desatualizadas. O código abaixo utiliza a sintaxe moderna do `@stellar/stellar-sdk`. A principal mudança é garantir que a conta de origem tenha o *trustline* (confiança) no ativo e que o `networkPassphrase` seja o correto para a rede que você está usando.

// 2.  **Pagamento Pix (real):** O trecho com o Stripe é um bom começo, mas para fazer um pagamento Pix no Brasil, você precisa de um provedor de pagamentos que suporte essa modalidade, como o **Stripe** ou a **Stripe Treasury**. O código real para gerar um QR code ou um código "Copia e Cola" do Pix envolveria chamadas à API da sua provedora.

// Abaixo está o código reescrito para refletir essas mudanças.

// ```javascript
// const User = require('../models/user');
// const { decrypt } = require('./authController');
// const { Keypair, Asset, Operation, Server, TransactionBuilder } = require('stellar-sdk');
// const { SorobanRpc, Contract, Networks } = require('@stellar/stellar-sdk');
// const stripe = require('stripe')(process.env.STRIPE_ACCESS_TOKEN);

// // --- Stellar Configuration ---
// const server = new Server('[https://horizon-testnet.stellar.org](https://horizon-testnet.stellar.org)');
// const networkPassphrase = Networks.TESTNET;

// exports.trocarCdrPorPix = async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const amountToSwap = 5; // Exemplo de valor de $CDRIVE para trocar
//     const brlValue = amountToSwap * 0.8; // Cotação simulada: 1 $CDRIVE = R$0.80

//     // Decrypt user's secret key
//     const userSecretKey = decrypt(user.stellar_secret_key_encrypted);
//     const userKeypair = Keypair.fromSecret(userSecretKey);
//     const platformPublicKey = process.env.CHAVE_PUBLICA_INVENTARIO;

//     // --- Transação Stellar REAL (movendo $CDRIVE para a plataforma) ---
//     const sourceAccount = await server.loadAccount(userKeypair.publicKey());
//     const asset = new Asset('CDRIVE', process.env.CDRIVE_ASSET_ISSUER);
//     const transaction = new TransactionBuilder(sourceAccount, {
//         fee: await server.fetchBaseFee(),
//         networkPassphrase: networkPassphrase,
//     })
//       .addOperation(Operation.payment({
//         destination: platformPublicKey,
//         asset: asset,
//         amount: String(amountToSwap)
//       }))
//       .build();
    
//     transaction.sign(userKeypair);
//     const txResult = await server.submitTransaction(transaction);
//     console.log('Stellar transaction submitted:', txResult);

//     // --- Pagamento PIX REAL (via Stripe) ---
//     // Você precisará de uma conta Stripe configurada para Pix no Brasil.
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(brlValue * 100), // O valor deve ser em centavos
//       currency: 'brl',
//       description: `Swap of ${amountToSwap} $CDRIVE`,
//       payment_method_data: {
//         type: 'pix',
//         // Adicionar informações necessárias para o Pix, como a chave do destinatário
//         // A chave do Pix do usuário (user.pix_key) será usada aqui.
//       },
//       // Confirme o pagamento imediatamente se a sua lógica de negócio permitir
//       confirm: true, 
//       payment_method_types: ['pix'],
//       metadata: {
//         user_id: userId,
//         stellar_tx_hash: txResult.hash
//       },
//       receipt_email: user.email,
//     });
    
//     // O Stripe retornará um PaymentIntent com o status do pagamento, 
//     // incluindo a URL ou o QR Code do Pix, que você pode mostrar ao usuário.
//     console.log('Stripe Payment Intent created:', paymentIntent);

//     res.status(200).json({ 
//       message: `Swap of ${amountToSwap} $CDRIVE for R$${brlValue.toFixed(2)} initiated.`,
//       pix_details: paymentIntent.next_action // ou outro campo relevante
//     });

//   } catch (error) {
//     res.status(500).json({ error: 'Failed to swap $CDRIVE for PIX', details: error.message });
//   }
// };