/**
 * Script to deploy the contract
 */
import { Signer, Contract, Provider } from "koilib";
import * as dotenv from "dotenv";
import { TransactionJson, TransactionOptions } from "koilib/lib/interface";
import { getBytecode } from "./utils";
import abi from "../build/modsignopenid-abi.json";
import koinosConfig from "../src/koinos.config.js";

dotenv.config();

if (!["true", "false"].includes(process.env.USE_FREE_MANA))
  throw new Error(`The env var USE_FREE_MANA must be true or false`);
const useFreeMana = process.env.USE_FREE_MANA === "true";

const [inputNetworkName] = process.argv.slice(2);

async function main() {
  const networkName = inputNetworkName || "harbinger";
  const network = koinosConfig.networks[networkName];
  if (!network) throw new Error(`network ${networkName} not found`);
  const provider = new Provider(network.rpcNodes);

  if (!network.accounts.contract.privateKeyWif) {
    throw new Error(
      `no private key defined for the contract in ${networkName}`,
    );
  }
  const contractAccount = Signer.fromWif(
    network.accounts.contract.privateKeyWif,
  );
  contractAccount.provider = provider;

  const rcLimit = "10000000000";
  let txOptions: TransactionOptions;
  if (useFreeMana) {
    txOptions = {
      payer: network.accounts.freeManaSharer.id,
      payee: contractAccount.address,
      rcLimit,
    };
  } else {
    if (!network.accounts.manaSharer.privateKeyWif) {
      throw new Error(
        `no private key defined for the manaSharer in ${networkName}`,
      );
    }
    const manaSharer = Signer.fromWif(
      network.accounts.manaSharer.privateKeyWif,
    );
    manaSharer.provider = provider;
    txOptions = {
      payer: manaSharer.address,
      payee: contractAccount.address,
      rcLimit,
      beforeSend: async (tx: TransactionJson) => {
        await manaSharer.signTransaction(tx);
      },
    };
  }

  const contract = new Contract({
    signer: contractAccount,
    provider,
    abi,
    options: txOptions,
  });

  const { receipt, transaction } = await contract.functions.set_cert({
    user: contractAccount.address,
    kid: '25f8211713788b6145474b5029b0141bd5b3de9c',
    public_key: 'QAAAAJO15x1lT18Lfq-_DeNbgVkMTFkJITUSn5ptiaLUNuhE2mSbzFb3H3neeWFFcwOpqN84AS0VgghfOZQb_Ygt9f8SSzV-tnQGG8IW7jA3Z27ceLR-caAkCzm53LWHeov717lhT5Cm9V7Z3BvHGbkcEBoOEWbSJX6YXxNMME4-0uFl_PhT25zxsPaaPwLitHNUByoKTXpxTPPx74Y4bpV1vrPIKZcFSWwdTuhMkEzkg-Y7tzoJCzRAywSKFI9WGXIClySpcb152SO6pDLdZnH0SYL9P7QuYoqx4goMYYLSsQaQOCmgDa8Xdz_lo6IAm8ZxK-NOIOAguAAke-7KrJqolHrC3KTSPZ6YNTLGwWBdExX_mTWiy3D9HHyuCCUUyENA5n_AEekaNaObsfVG1Vf2nR-1CB49dWv2djgUv2fs-4XCqwrmULGXrR09mCs_CgEpxHy0cr7nXGlwmeZIhfTpr5pitLKrYvy0ZCRrVr_ld2gS4AXVlgc_KhaWkTJTLisuAh-XUXryxLJ5qUbvta0Vlh2cu0c-6268Fp6XofAdhRbDvrZp9XNzYl-HopXrSN28QhfItQ_8Vn_8PocfI-nWyHcCn5m6BLaxpFaCIx1BZQhHOwT5gAmxu3a_QHnSr8-K7cu-m2a0O-HjvZ0tyyjIwz3BZ4cPaju678SVAuINFOR_IHKi0A',
    iss: 'https://dev-20wwtprazz4uio4u.us.auth0.com/'
  });
  console.log("Transaction submitted");
  console.log(
    `consumption: ${(Number(receipt.rc_used) / 1e8).toFixed(2)} mana`,
  );
  const { blockNumber } = await transaction.wait("byBlock", 60000);
  console.log(
    `Contract ${contractAccount.address} uploaded in block number ${blockNumber} (${networkName})`,
  );
}

main()
  .then(() => {})
  .catch((error) => console.error(error));
