// Keypair == to generate public/private key pairs
// Connection == establish connection to a Solana RPC node
import { Keypair, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import * as fs from 'fs'; // read & write files
import bs58 from 'bs58'; // encoding

// const endpoint = "https://api.devnet.solana.com"; // Devnet endpoint
const endpoint = 'https://api.mainnet-beta.solana.com' // PRD endpoint
const solanaConnection = new Connection(endpoint);

// ----------Create key pair----------
const keypair = Keypair.generate();
console.log(`Generated new KeyPair.`);
console.log(`Wallet PublicKey: `, keypair.publicKey.toString());

const privateKey = bs58.encode(keypair.secretKey);
console.log(`Wallet PrivateKey:`, privateKey);

// ----------saving secret key to json----------
const secret_array = keypair.secretKey
  .toString()
  .split(',')
  .map(value => Number(value));

const secret = JSON.stringify(secret_array);

fs.writeFile('secret.json', secret, 'utf8', function(err) {
  if (err) throw err;
  console.log('Wrote secret key to Secret.json.');
});

// ----------Airdrop: request SOL for test purpose---------- ==> on Devnet ==> 0 monetary value
(async () => {
  const airdropSignature = solanaConnection.requestAirdrop(
    keypair.publicKey,
    LAMPORTS_PER_SOL / 10,
  );
  try {
    const txId = await airdropSignature;
    console.log(`Airdrop Transaction Id: ${txId}`);
    console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);
  } catch (err) {
    console.log(err);
  }
})();
