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
    kid: 'aflKvysAFKrrEhmlCSNio',
    public_key: 'QAAAAMM8CuoVrPLU76pueLYVJ0zAsRVYEVO0CHR7RQrbH2TBuqR8JlVGUGXTi-yon7zTSs5EzI2_9PfinUySZT8B7Oh-YyYxHZPM8rBkpDkAJGtwQIeakoMI-LfVD97gAXYUVyEI9hTgRJoWlf6dMGRRrMjcf9kRHi_TT_oaq7JRIQbHvYsxk-Uj0--ao4dCYgurEhOwpcwekq4E0P1dqrLR7UqZoE7JOXGYXUtvYiu2ZQy52gHUKTi4mfgatOXIhf1ZBYqcyjamrmtm0T1i4d75OCg03MGyELe_gYhMUqKjRBQMcmWdxrBpDphomtXhRh_XksT0L_w4hAxZ4oHRltviUd4qC9TM3RnGiMtu2vRv0DE5IT-fpP6dwmmilzK-QTiKvUvJ2yFZta1eIvPUMcWWdZOYX0XhlUAHDEAIqxhba2m-IJeLp0Gi-5DsYvKpyOSbj_AlsYUJvFRni-jbqz4NMPyrReKQAJpQgXELDo7Qn16XZQlefm6DUFwgs4qgcScvYvVRsQfQHo3IqM3FWc3enxs8Me2EFcQD7x_RqBrj_bpVQuiDPZPzIWO9Ge6hU9E7NsNQnTKIlEwDUCD9VAPRy9y6Xw2il-1CmWNUrPUfuFjvXbXYplA02Yu_FG_KxdCcOPn1Z8PTmcW69LLV5C_OCrMooSjIc_Q65TwqpXIn6T5ulnNMHQ==',
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
