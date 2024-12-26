// NOT NEEDED IF YOU FOLLOW THE TUTORIAL

// Keypair == to generate public/private key pairs
// Connection == establish connection to a Solana RPC node
import { Keypair, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import * as fs from 'fs'; // read & write files
import bs58 from 'bs58'; // encoding

const endpoint = "https://api.devnet.solana.com"; // Devnet endpoint
// const endpoint = 'https://api.mainnet-beta.solana.com' // PRD endpoint
const solanaConnection = new Connection(endpoint);

// ----------Load key pair from secret.json----------
let keypair: Keypair;
try {
  const secretData = fs.readFileSync('secret.json', 'utf8');
  const secretArray = JSON.parse(secretData) as number[];
  keypair = Keypair.fromSecretKey(Uint8Array.from(secretArray));
  console.log(`Loaded KeyPair from Secret.json`);
  console.log(`Wallet PublicKey: `, keypair.publicKey.toString());


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

} catch (err) {
    if (err instanceof Error) {
        console.error(err.message); // Access the `message` property
    } else {
        console.error('An unexpected error occurred:', err);
    }
}
