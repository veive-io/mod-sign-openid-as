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
    kid: '9d270838fc9602d324b726c02f7e3f47d4306bb2acbefccf4c5d88c033be6482',
    public_key: 'QAAAABMmt13la9tEProanx7MVBKF0GUaP5o4zg7XNwfU50CNECdiU6DHMCtpkVKmZccRb9FXacP29HVhTW8eCAC2CsIih-zLiXZcl6dGi4UFx8PsmmQtfyTbAV8JzTKAWU3GqvNgOCrSfCdNGne9DM3OkOSEsHA_F4wCbIsa3IsuVA5awAPogrCbmgmiUgo9gfiK2_3bK1nSw6eeNC-evvsxROz1vUe9-AaPyyReDrfj5xe5PeaEMDSlO_bfS6VsM3QFcULeN8quK4-ECNmd4lmy2ZHaofu35JFJ2m2RbKMajKnEGgN2e2HjVk8O5vnxvUR2dnjk3HU2W3n7U8ZsM7U-q3J5WGaZww6DTD31LcElwKvQydKKABRI71IuynR7TLRhqDVInLcBzzc_O5rw28aL8ehk7pi8qOBFExA_kXP8t2mPOoB3EvXeA7WPqrtAxjKRBGjgl9ZcY7I3QIcQBqyjTWRppnyugRkr1ShR-4EFvM2ud-IiF_-vdzPAViQUInfy3X4jq7XMLUwqJHC19A52CtNUf5nGn6b-mJ3ePdXP3-t4aQwMAF5CXAF8yeG2WMzKVUJpCFfjIB7aON5mua96_2VHNj59fLXbmlBCVzljk9PHCq7qNGP6CQTsMHg9unx90TM2x9UYcfahXY2Yl3ZZ-cLwzYfOm_QIdYiPeqEIyy0n6Z49bw==',
    iss: 'https://broker.sovrano.app/'
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
