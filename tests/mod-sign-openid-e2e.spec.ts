import { LocalKoinos } from "@roamin/local-koinos";
import { Contract, Signer, Transaction, Provider, utils, Serializer } from "koilib";
import path from "path";
import { randomBytes } from "crypto";
import { beforeAll, afterAll, it, expect } from "@jest/globals";
import * as dotenv from "dotenv";
import * as modAbi from "../build/modsignopenid-abi.json";
import * as accountAbi from "@veive-io/account-as/dist/account-abi.json";
import { promises as fs } from 'fs';
import { Buffer } from "buffer";

dotenv.config();

jest.setTimeout(600000);

const verifierAbiPath = path.join(__dirname, "/../node_modules/@veive-io/verifier-rs256/dist/abi/verifier.koilib.abi");

const TEST_DATA: any = {};

TEST_DATA.JWT = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkMTJhYjc4MmNiNjA5NjI4NWY2OWU0OGFlYTk5MDc5YmI1OWNiODYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDEzNDg4ODc0MzI5NDg2MzU3NTUiLCJlbWFpbCI6ImFkcmkuZm9zY2hpQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiVGtoRXpqdFpRX1RrTmlyUlNNMndqUSIsIm5hbWUiOiJBZHJpYW5vIEZvc2NoaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJZkF3WlFidTlodUFsQmZ5NWhpYTVVNThhYjVILS11SThtU0l4TEtZWXQwZFZOWDNlWD1zOTYtYyIsImdpdmVuX25hbWUiOiJBZHJpYW5vIiwiZmFtaWx5X25hbWUiOiJGb3NjaGkiLCJpYXQiOjE3Mzk5NjQ2MTcsImV4cCI6MTczOTk2ODIxN30.BKLA6Vd2F0wzw9x_SxVL1_T5wvYIhCReE2Kdu55Hwf67jxeYgFLgREXhqcbZtJ9jXN2h1kWW6nuYShHyp0CwriH1uPIE4rvequmfjCLDkrWQghnZulVCqajQvDMSGaGkNoUZ3HL8DJvTZxBzOl8dsHovtFEtqxhll1YYuO2NB31HzZKtoTDwYglZv1T-DrYdJO27xY4of_xGiTt7fN16DXJmcvK23VHOww5O50UXHeEeitIpGnIqWGr5hw5ZiS8AlQmB3OizwSz-96_sx0djhSf9aX1EQyvzC3ZaxCg9PAWPip4XlwpmI_eF4Uxz_192xrmuu0PRgXcn5UpJ5AAfyw";
TEST_DATA.JWT_DECODED = decodeJwt(TEST_DATA.JWT);
TEST_DATA.PUBLIC_KEY = "QAAAAJPGUC5luPifDN3dpVx8QOeeU4oX9zeIbsC8JozXIuasP3iDs8yi9HP0aNUdbhLLWJL2gtfxqEEzL0olGgp8u9pDPBxYeqalWMTadbOcXsW2T5O5MKLcVNVvHKWNqXoybuYHFLDCYQesTXDTYr-TUPSYOTWzLn0eJxXPtexoTPmUzpXWzD5s1NteaQmfyRz1R2kHTBeVqKdU08uIahPO0SVdIyNOC9f76dedxbGiTRCYu_E1J0DRAtOsjdsCUdUwtaGUo5lgVQpK-6DWlMiDkLGHf7Jq5VyrZtuLaMiOfThH4tE0yp0ojDXUG0exFvjC8g6NibGk61mrlsdxrSuMKBc1O6e5W39-DGH23ntyz1K4Fikv0j2_An-A-8Zpkb1ht49KHDWsbhbx1OU7cT2T5Nw5ACwsygVX3c9DVs6A51GYAI3imRnSX_g9fLRl7x0khf7JHqNHO-oo_XqbggVCwBuBlb6jlLvs1sG7CDxqr5QkdiJ1FpDnRXl7hKLmXLFH48UuylWt9bGhn69iJkhLOLhIeQh5efiOOW9JCfNoYuOYcLiyrIbhnZWoRJMT920LODlq872HDfz49IAm1uW4iQfn0Xteq2hvXzvDHHtlUilC9unuAs4513LnwBM_WYgIMeMAnUG9E6Lq47Yy_He0loCtlyOApPkLEFI4exQJ5p614qI2Yw"
    + "==";
TEST_DATA.TX_ID = "0x1220b1e69be05c5ed1f4fff68ef4c3168142e5c9ebd1856fe27baab7cd6ab5609b4b";

const localKoinos = new LocalKoinos();
const provider = localKoinos.getProvider() as unknown as Provider;

const modSign = new Signer({
    privateKey: randomBytes(32).toString("hex"),
    provider
});

const modContract = new Contract({
    id: modSign.getAddress(),
    abi: modAbi,
    provider
}).functions;

const accountSign = new Signer({
    privateKey: randomBytes(32).toString("hex"),
    provider
});

const accountContract = new Contract({
    id: accountSign.getAddress(),
    abi: accountAbi,
    provider
}).functions;

const verifireSign = Signer.fromWif(process.env.VERIFIER_PRIVATE_KEY);
verifireSign.provider = provider;

beforeAll(async () => {
    // start local-koinos node
    await localKoinos.startNode();
    await localKoinos.startBlockProduction();

    // deploy mod contract
    await localKoinos.deployContract(
        modSign.getPrivateKey("wif"),
        path.join(__dirname, "../build/release/ModSignOpenid.wasm"),
        modAbi
    );

    const verifierAbiContent = await fs.readFile(verifierAbiPath, 'utf8');
    const verifierAbi = JSON.parse(verifierAbiContent);

    // deploy verifier
    await localKoinos.deployContract(
        verifireSign.getPrivateKey("wif"),
        path.join(__dirname, "../node_modules/@veive-io/verifier-rs256/dist/release/verifier.wasm"),
        verifierAbi
    );

    // deploy account contract
    await localKoinos.deployContract(
        accountSign.getPrivateKey("wif"),
        path.join(__dirname, "../node_modules/@veive-io/account-as/dist/release/Account.wasm"),
        accountAbi,
        {},
        {
            authorizesCallContract: true,
            authorizesTransactionApplication: false,
            authorizesUploadContract: false,
        }
    );
});

afterAll(() => {
    // stop local-koinos node
    localKoinos.stopNode();
});

it("install module", async () => {
    const { operation: install_module } = await accountContract["install_module"]({
        module_type_id: 3,
        contract_id: modSign.address
    }, { onlyOperation: true });

    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    const { operation: exec } = await accountContract["execute_user"]({
        operation: {
            contract_id: install_module.call_contract.contract_id,
            entry_point: install_module.call_contract.entry_point,
            args: install_module.call_contract.args
        }
    }, { onlyOperation: true });

    await tx.pushOperation(exec);
    const receipt = await tx.send();
    await tx.wait();

    expect(receipt).toBeDefined();
    expect(receipt.logs).toContain("[mod-sign-openid] called on_install");

    const { result } = await accountContract["get_modules"]();
    expect(result.value[0]).toStrictEqual(modSign.address);
});


it("register credential", async () => {
    const [header, payload, signature] = TEST_DATA.JWT.split('.');
    const { operation } = await modContract['register']({
        user: accountSign.address,
        sub: TEST_DATA.JWT_DECODED.PAYLOAD.sub,
        iss: TEST_DATA.JWT_DECODED.PAYLOAD.iss
    }, { onlyOperation: true });

    //send operations
    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    await tx.pushOperation(operation);
    const rc = await tx.send();

    expect(rc).toBeDefined();
    await tx.wait();

    const payload_decoded = Buffer.from(payload, 'base64').toString('utf-8');
    const payload_object = JSON.parse(payload_decoded);

    const { result: r1 } = await modContract['get_credentials']({
        user: accountSign.address
    });

    expect(r1.value.length).toBe(1);
    expect(r1.value[0].sub).toStrictEqual(payload_object.sub);
    expect(r1.value[0].iss).toStrictEqual(payload_object.iss);

    const { result: r2 } = await modContract['get_address']({
        iss: payload_object.iss,
        sub: payload_object.sub
    });
    expect(r2.value).toStrictEqual(accountSign.address);
});


it("set cert", async () => {
    const { operation } = await modContract['set_cert']({
        kid: TEST_DATA.JWT_DECODED.HEADER.kid,
        public_key: TEST_DATA.PUBLIC_KEY,
        iss: TEST_DATA.JWT_DECODED.PAYLOAD.iss
    }, { onlyOperation: true });

    //send operations
    const tx = new Transaction({
        signer: modSign,
        provider
    });

    await tx.pushOperation(operation);
    const rc = await tx.send();

    expect(rc).toBeDefined();
    await tx.wait();

    const { result: r1 } = await modContract['get_cert']({
        kid: TEST_DATA.JWT_DECODED.HEADER.kid
    });

    expect(r1).toBeDefined();
    expect(r1.iss).toStrictEqual(TEST_DATA.JWT_DECODED.PAYLOAD.iss);
    expect(r1.public_key).toStrictEqual(TEST_DATA.PUBLIC_KEY);
});


it("validate signature", async () => {
    const { operation } = await modContract['is_valid_signature']({
        sender: accountSign.address,
        signature: await createSignature(),
        tx_id: TEST_DATA.TX_ID
    }, { onlyOperation: true });

    //send operations
    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    await tx.pushOperation(operation);
    const rc = await tx.send();
    await tx.wait();

    console.log(rc);
    expect(rc).toBeDefined();
    expect(rc.logs).toContain('[mod-sign-openid] valid signature');
});

it("register credential, iss already registered", async () => {
    const { operation } = await modContract['register']({
        user: accountSign.address,
        sub: '1234',
        iss: TEST_DATA.JWT_DECODED.PAYLOAD.iss
    }, { onlyOperation: true });

    //send operations
    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    await tx.pushOperation(operation);
    
    let error = null;
    try {
        await tx.send();
    } catch (e) {
        console.log(e);
        error = e;
    }

    expect(error).toBeDefined();
});

it("unregister credential", async () => {
    const { operation } = await modContract['unregister']({
        user: accountSign.address,
        sub: TEST_DATA.JWT_DECODED.PAYLOAD.sub,
        iss: TEST_DATA.JWT_DECODED.PAYLOAD.iss
    }, { onlyOperation: true });

    //send operations
    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    await tx.pushOperation(operation);
    const rc = await tx.send();

    expect(rc).toBeDefined();
    await tx.wait();

    const { result: r1 } = await modContract['get_credentials']({
        user: accountSign.address
    });
    expect(r1).toBeUndefined();
});

// Creiamo il `bytes` che contiene i 3 campi per lo smart contract
async function createSignature(): Promise<string> {
    const descriptorJson = {
        nested: {
            jwt: {
                fields: {
                    header: {
                        type: "bytes",
                        id: 1
                    },
                    payload: {
                        type: "bytes",
                        id: 2
                    },
                    signature: {
                        type: "bytes",
                        id: 3
                    }
                }
            },
        },
    };

    const [header, payload, signature] = TEST_DATA.JWT.split('.');
    const serializer1 = new Serializer(descriptorJson);
    const sign = await serializer1.serialize({
        header,
        payload,
        signature
    }, "jwt");

    const prefix = new Uint8Array([0xFF, 0x03]);
    const signWithPrefix = new Uint8Array(prefix.length + sign.length);
    signWithPrefix.set(prefix, 0);
    signWithPrefix.set(sign, prefix.length);
    return utils.encodeBase64url(signWithPrefix);
}

export function decodeJwt (jwt: string): any {
    const [header, payload, signature] = jwt.split('.');
    const headerJson = (new TextDecoder()).decode(utils.decodeBase64url(header));
    const payloadJson = (new TextDecoder()).decode(utils.decodeBase64url(payload))
    return {
        HEADER: JSON.parse(headerJson),
        PAYLOAD: JSON.parse(payloadJson),
        SIGNATURE: signature
    };
}