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

TEST_DATA.JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlZxRHFnSWJfdlNHeXZrOXdONHRZMyJ9.eyJnaXZlbl9uYW1lIjoiQWRyaWFubyIsImZhbWlseV9uYW1lIjoiRm9zY2hpIiwibmlja25hbWUiOiJhZHJpLmZvc2NoaSIsIm5hbWUiOiJBZHJpYW5vIEZvc2NoaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJZkF3WlFidTlodUFsQmZ5NWhpYTVVNThhYjVILS11SThtU0l4TEtZWXQwZFZOWDNlWD1zOTYtYyIsInVwZGF0ZWRfYXQiOiIyMDI1LTAzLTA2VDIxOjU0OjI2LjMzMFoiLCJlbWFpbCI6ImFkcmkuZm9zY2hpQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2Rldi0yMHd3dHByYXp6NHVpbzR1LnVzLmF1dGgwLmNvbS8iLCJhdWQiOiJCM1NuTmVlcGJyM01kUTRaWXRNcWV3cmlrSzVwcVVqZCIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAxMzQ4ODg3NDMyOTQ4NjM1NzU1IiwiaWF0IjoxNzQxMjk4MDY2LCJleHAiOjE3NDEzMzQwNjYsInNpZCI6IlhfcEVhTTFlR25xeU5EMWVMa3BIenVPTUs1V2pGTzhSIiwibm9uY2UiOiJyYW5kb21TdHJpbmcifQ.V7R7AdBgMtwKiSqWqpYYHwWKiLatORhSuU3ce7qFiL4dWQ9p0AMTIMWInBsExU0tn7tSsGDEmGvIqnGUJ7yfYFbIgDYxrjtaGHjXbJqDQUlDoEzwzhPgVymw5K7dikZxhuPNH3s6wAEeSSQaw4HJCy_MPPyTID7OZ6MAAZPhtiM4f8N0XbSKop7XfWBb7naj2gXNVys7E_i9YWKq2YHwF2nJtlT-8u3Nv22rW-XPbZpxYdOHiAvAyEsXNi83Kv2n92_FH1aWaCqRc_oRtkP493xA1umR9ABBEp2egVnayFBD2QvrWljS8m0Sw6U8OEn_z8P25B63d1esL_pfS5nDOg";
TEST_DATA.JWT_DECODED = decodeJwt(TEST_DATA.JWT);
TEST_DATA.PUBLIC_KEY = "QAAAADlLyDT3zD43vy7tXKhS3EEDw0a-tSyjXcoW0xCCcOoOFbj2wtZgqkqhbeeMtNrJ2yRI5BJiE82hJ0Gi3629OoCSutobohN3fm8udfF3RL6Khp9FHhjQFyiUvvaNHRZsjQAdgHNR362scPEKDTbcm-poddDkL9i_QQpCULDcW5nDdRgC-ueg7eIcFj4_RmFY23dHd-zg74KUsklkUK3fHf-O8J5P5UvoIJJrkeK7bRz81wZtWFc1ItdvGELqCLhVnd3KNbGs5a8bmQ70iS8yaTCZ3A6MWmSYHLDzbPr1zOqDWPNpg1QMol4mP8ziYRvQiK8eioiilhgzY5DzUw5K4cTcgaybAJLwF2LrYKvupqv0vmry6QzWzFn3Phj7r47_LUm5n77HhCo0crfU7Va8_UScWWN1ZQDj1UrPDbfbL-no0n_9FLXuMPFOjmQgdhLh4iuPbQyEdJ1IcCCkmy9mOQsGBmnphEba57CPsHb7gvAm3U6T0lGNGpMTzwjvHBGxGLqS_dCXA-lqHlKnlKxHxOFzvhIa7JZnUyjlYR6oQzfSSSot9uX_TNGLiVYjT2YlS3D6CuASrNw2zgsg_WLBYun072bphgj3lP_dTDxiczQxAW6mBiVxlG5WsDS_DMBzvrc1kzzHq-NeyNNp2EdL86mAjrLq-RnCqV7Ex_WGWHiXByfHTQ"
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

it("register credential, is already registered", async () => {
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

    let error = null;
    try {
        const receipt = await tx.send();
        console.log('rrrr', receipt)
        await tx.wait();
    } catch (e) {
        console.log(e);
        error = e;
    }

    expect(error).toBeDefined();
});

/*
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
*/

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
