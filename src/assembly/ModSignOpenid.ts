import { StringBytes, System, Storage, Base58, Protobuf, authority, Crypto, Base64 } from "@koinos/sdk-as";
import { modsignopenid } from "./proto/modsignopenid";
import { ModSign, modsign, MODULE_SIGN_TYPE_ID } from "@veive-io/mod-sign-as";
import { base64ToBase64url, getValueFromJSON } from "./utils";
import UserStorage from "./UserStorage";
import { verifier, IVerifier } from "@veive-io/verifier-rs256";
import { VERIFIER_CONTRACT_ID } from "./Constants";

const CREDENTIAL_STORAGE_SPACE_ID = 1;
const CERT_SPACE_ID = 2;
const JWT_TIMELIFE_MS = 60*1000;
const SIGNATURE_PREFIX = [0xFF, 0x03];

export class ModSignOpenid extends ModSign {
  callArgs: System.getArgumentsReturn | null;

  contractId: Uint8Array = System.getContractId();
  credential_storage: UserStorage = new UserStorage(CREDENTIAL_STORAGE_SPACE_ID, CREDENTIAL_STORAGE_SPACE_ID + 1, 100);

  credentials(user: Uint8Array): Storage.Map<Uint8Array, modsignopenid.credential> {
    const space_id = this.credential_storage.get_space_id(user);
    return new Storage.Map(
      this.contractId,
      space_id,
      modsignopenid.credential.decode,
      modsignopenid.credential.encode,
      () => new modsignopenid.credential()
    );
  }

  credential_address: Storage.Map<Uint8Array, modsignopenid.address> = new Storage.Map(
    this.contractId,
    0,
    modsignopenid.address.decode,
    modsignopenid.address.encode,
    () => new modsignopenid.address()
  );

  cert: Storage.Map<Uint8Array, modsignopenid.cert> = new Storage.Map(
    this.contractId,
    CERT_SPACE_ID,
    modsignopenid.cert.decode,
    modsignopenid.cert.encode,
    () => new modsignopenid.cert(),
  );

  /**
   * @external
   */
  register(args: modsignopenid.register_arguments): void {
    const isAuthorized = System.checkAuthority(authority.authorization_type.contract_call, args.user!);
    System.require(isAuthorized, `[mod-sign-openid] Not authorized by the account`);

    const credential = new modsignopenid.credential(args.sub!, args.iss!);
    const credential_bytes = this._get_credential_key(args.sub!, args.iss!);

    System.require(this.credential_address.has(credential_bytes) == false, `[mod-sign-open-id] ${args.iss!}:${args.sub!} already registered`);

    this.credentials(args.user!).put(credential_bytes, credential);

    const address = new modsignopenid.address(args.user!);
    this.credential_address.put(credential_bytes, address);
  }

  /**
   * @external
   */
  unregister(args: modsignopenid.unregister_arguments): void {
    const isAuthorized = System.checkAuthority(authority.authorization_type.contract_call, args.user!);
    System.require(isAuthorized, `not authorized by the account`);

    const credential_bytes = this._get_credential_key(args.sub!, args.iss!);

    this.credentials(args.user!).remove(credential_bytes);
    this.credential_address.remove(credential_bytes);
  }

  /**
   * @external
   */
  is_valid_signature(args: modsign.is_valid_signature_args): modsign.is_valid_signature_result {
    const result = new modsign.is_valid_signature_result(false);
    const tx_signature_prefixed = args.signature!;

    // Check if the signature is open-id signature by checking prefix
    if (tx_signature_prefixed[0] == SIGNATURE_PREFIX[0] && tx_signature_prefixed[1] == SIGNATURE_PREFIX[1]) {
      const tx_signature = tx_signature_prefixed.subarray(2);
      const jwt = Protobuf.decode<modsignopenid.jwt>(tx_signature, modsignopenid.jwt.decode);

      System.require(jwt.header != null, `[mod-sign-openid] Missing header`);
      System.require(jwt.payload != null, `[mod-sign-openid] Missing payload`);
      System.require(jwt.signature != null, `[mod-sign-openid] Missing signature`);

      const payload_json = StringBytes.bytesToString(jwt.payload);
      const header_json = StringBytes.bytesToString(jwt.header);

      const kid = getValueFromJSON(header_json, "kid")!;
      System.require(kid != null, `[mod-sign-openid] Missing kid`);

      const alg = getValueFromJSON(header_json, "alg")!;
      System.require(alg == "RS256", `[mod-sign-openid] Invalid algorithm: expected RS256`);

      const iss = getValueFromJSON(payload_json, "iss")!;
      System.require(iss != null, `[mod-sign-openid] Missing issuer`);

      const sub = getValueFromJSON(payload_json, "sub")!;
      System.require(sub != null, `[mod-sign-openid] Missing sub`);

      const credential_bytes = this._get_credential_key(sub, iss);

      const address = this.credential_address.get(credential_bytes);
      System.require(address != null, `[mod-sign-openid] Missing address for sub ${sub}`);

      const credential = this.credentials(address!.value!).get(credential_bytes);
      System.require(iss == credential!.iss, `[mod-sign-openid] Invalid iss`);

      const exp_str = getValueFromJSON(payload_json, "exp");
      System.require(exp_str != null, `[mod-sign-openid] Missing exp`);

      const iat_str = getValueFromJSON(payload_json, "iat");
      System.require(iat_str != null, `[mod-sign-openid] Missing iat`);

      const now = System.getBlockField("header.timestamp")!.uint64_value;
      const exp : u64 = U64.parseInt(exp_str! + '000');
      System.require(exp > now, `[mod-sign-openid] jwt is expired at ${exp}`);
      const iat : u64 = U64.parseInt(iat_str! + '000');
      System.require(iat + JWT_TIMELIFE_MS > now, `[mod-sign-openid] jwt is not valid anymore. Expired at ${iat + JWT_TIMELIFE_MS}`);
      
      const cert = this.cert.get(StringBytes.stringToBytes(kid));
      System.require(cert != null, `[mod-sign-openid] Missing cert`);

      const header_b64u = base64ToBase64url(Base64.encode(jwt.header!));
      const payload_b64u = base64ToBase64url(Base64.encode(jwt.payload!));
      const message_str = header_b64u + '.' + payload_b64u;
      const message = StringBytes.stringToBytes(message_str);
      const message_multihash = System.hash(Crypto.multicodec.sha2_256, message);
      const mh = new Crypto.Multihash();
      mh.deserialize(message_multihash!);
      const message_sha256 = mh.digest;

      // verify rs256 signature
      const verifierContract = new IVerifier(Base58.decode(VERIFIER_CONTRACT_ID));
      const verify = verifierContract.verify(new verifier.verify_arguments(jwt.signature!, cert!.public_key, message_sha256)).value;
      if (verify == 1) {
        result.value = true;
        System.log(`[mod-sign-openid] valid signature`);
      } else {
        System.log(`[mod-sign-openid] invalid signature`);
      }
    }

    return result;
  }


  /**
   * Get credential pairs
   *
   * @external
   * @readonly
   * @param args
   * @returns
   */
  get_credentials(args: modsignopenid.get_credentials_args): modsignopenid.get_credentials_result {
    const res = new modsignopenid.get_credentials_result();
    res.value = [];

    const credentialDataKeys = this.credentials(args.user!).getManyKeys(new Uint8Array(0));

    for (let i = 0; i < credentialDataKeys.length; i++) {
      const credential_key = credentialDataKeys[i];
      const credential = this.credentials(args.user!).get(credential_key)!;
      res.value.push(credential);
    }

    return res;
  }

  /**
   * Get address by sub
   * 
   * @external
   * @readonly
   */
  get_address(args: modsignopenid.get_address_args): modsignopenid.address {
    const credential_bytes = this._get_credential_key(args.sub!, args.iss!);
    const address = this.credential_address.get(credential_bytes);
    if (!address) {
      System.fail(`[mod-sign-openid] credential not found`);
    }

    return address!;
  }

  /**
   * Get user data
   * @external
   * @readonly
   */
  get_cert(args: modsignopenid.get_cert_args): modsignopenid.cert {
    const kid = StringBytes.stringToBytes(args.kid!);
    return this.cert.get(kid)!;
  }

  /**
   * Set user data
   * @external
   */
  set_cert(args: modsignopenid.set_cert_args): void {
    const isAuthorized = System.checkAuthority(authority.authorization_type.contract_call, this.contractId);
    System.require(isAuthorized,`not authorized by ${Base58.encode(this.contractId)}`);

    const cert = new modsignopenid.cert();
    cert.iss = args.iss!;
    cert.public_key = args.public_key!;

    const kid = StringBytes.stringToBytes(args.kid!);
    this.cert.put(kid, cert);
  }

  /**
  * @external
  */
  on_install(args: modsign.on_install_args): void {
    System.log('[mod-sign-openid] called on_install');
  }

  /**
   * @external
   * @readonly
   */
  manifest(): modsign.manifest {
    const result = new modsign.manifest();
    result.name = "Openid signature validator";
    result.description = "Module for validation of Openid signatures";
    result.type_id = MODULE_SIGN_TYPE_ID;
    result.version = "2.0.1";
    return result;
  }

  _get_credential_key(sub: string, iss: string) : Uint8Array {
    const credential = new modsignopenid.credential(sub, iss);
    return Protobuf.encode<modsignopenid.credential>(credential, modsignopenid.credential.encode);
  }
}

