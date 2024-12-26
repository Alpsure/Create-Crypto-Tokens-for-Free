// ----------import libraries---------- ==> code written by others & tested by many to speed up our development
import { 
    percentAmount, 
    generateSigner, 
    signerIdentity, 
    createSignerFromKeypair,
    publicKey
  } from '@metaplex-foundation/umi'
  import { 
    TokenStandard, 
    createAndMint, 
    mplTokenMetadata 
  } from '@metaplex-foundation/mpl-token-metadata'
  import { 
    createUmi 
  } from '@metaplex-foundation/umi-bundle-defaults';
  import { 
    createSetAuthorityInstruction, 
    AuthorityType 
  } from '@solana/spl-token';
  import { 
    Transaction, 
    PublicKey as Web3PublicKey,
    Connection,
    Keypair
  } from '@solana/web3.js';
  import * as fs from 'fs';
  
  const secret = JSON.parse(fs.readFileSync('./secret.json', 'utf8'));
  
  // ----------set variables---------- ==> creating clear names to later use in the logic to make the code more readable
  // rpc = remote procedure call --> a gateway to the Solana network
  //   const rpcUrl = 'https://api.devnet.solana.com'; // DEV
    const rpcUrl = 'https://api.mainnet-beta.solana.com'; // PRD
  // umi = a developer toolkit to intreact with Solana programs and the blockchain
  const umi = createUmi(rpcUrl);
  const connection = new Connection(rpcUrl);
  
  const userWalletBytes = new Uint8Array(secret.secret_alpsure_video);
  const userWallet = Keypair.fromSecretKey(userWalletBytes);
  
  const userWalletSigner = createSignerFromKeypair(umi, 
    umi.eddsa.createKeypairFromSecretKey(userWalletBytes)
  );
  
  const metadata = {
    name: "Something",  
    symbol: "SMTH",   
    uri: "",
  }; // uri hosted by pinata
  
  // mint =  a specific account on the Solana blockchain that governs a token. This account will be the 'master account' of our token.
  const mint = generateSigner(umi);
  
  // ----------Setup to interact with the blockchain----------
  umi.use(signerIdentity(userWalletSigner));
  umi.use(mplTokenMetadata())
  
  // ----------Execution----------
  // FYI: mint & freeze authority can't be revoked on creation because then 0 tokens could get minted
  // -- step 1: create and mint
  createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: percentAmount(0), // The creator or seller will not receive any transaction fee from the sale or transfer of this token
    decimals: 8,
    amount: 100000000_00000000, // 100 million
    tokenOwner: publicKey(userWallet.publicKey.toBase58()),
    tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi)
  // -- step 2: revoke mint & freeze authority
  .then(async () => {
    const transaction = new Transaction().add(
      // remove mint authority
      createSetAuthorityInstruction(
        new Web3PublicKey(mint.publicKey.toString()),
        userWallet.publicKey,
        AuthorityType.MintTokens,
        null
      ),
      // remove freeze authority
      createSetAuthorityInstruction(
        new Web3PublicKey(mint.publicKey.toString()),
        userWallet.publicKey,
        AuthorityType.FreezeAccount,
        null
      )
    );
  
    await connection.sendTransaction(transaction, [userWallet]);
  
    console.log("Successfully minted and removed authorities for tokens (", mint.publicKey, ")");
  })
  .catch((err) => {
    console.error("Error minting tokens:", err);
  });
