import { Writer, Reader } from "as-proto";

export namespace modsignopenid {
  export class credential {
    static encode(message: credential, writer: Writer): void {
      const unique_name_sub = message.sub;
      if (unique_name_sub !== null) {
        writer.uint32(10);
        writer.string(unique_name_sub);
      }

      const unique_name_iss = message.iss;
      if (unique_name_iss !== null) {
        writer.uint32(18);
        writer.string(unique_name_iss);
      }

      if (message.created_at != 0) {
        writer.uint32(24);
        writer.uint64(message.created_at);
      }
    }

    static decode(reader: Reader, length: i32): credential {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new credential();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.sub = reader.string();
            break;

          case 2:
            message.iss = reader.string();
            break;

          case 3:
            message.created_at = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    sub: string | null;
    iss: string | null;
    created_at: u64;

    constructor(
      sub: string | null = null,
      iss: string | null = null,
      created_at: u64 = 0
    ) {
      this.sub = sub;
      this.iss = iss;
      this.created_at = created_at;
    }
  }

  export class jwt {
    static encode(message: jwt, writer: Writer): void {
      const unique_name_header = message.header;
      if (unique_name_header !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_header);
      }

      const unique_name_payload = message.payload;
      if (unique_name_payload !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_payload);
      }

      const unique_name_signature = message.signature;
      if (unique_name_signature !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_signature);
      }
    }

    static decode(reader: Reader, length: i32): jwt {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new jwt();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.header = reader.bytes();
            break;

          case 2:
            message.payload = reader.bytes();
            break;

          case 3:
            message.signature = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    header: Uint8Array | null;
    payload: Uint8Array | null;
    signature: Uint8Array | null;

    constructor(
      header: Uint8Array | null = null,
      payload: Uint8Array | null = null,
      signature: Uint8Array | null = null
    ) {
      this.header = header;
      this.payload = payload;
      this.signature = signature;
    }
  }

  export class register_arguments {
    static encode(message: register_arguments, writer: Writer): void {
      const unique_name_user = message.user;
      if (unique_name_user !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_user);
      }

      const unique_name_sub = message.sub;
      if (unique_name_sub !== null) {
        writer.uint32(18);
        writer.string(unique_name_sub);
      }

      const unique_name_iss = message.iss;
      if (unique_name_iss !== null) {
        writer.uint32(26);
        writer.string(unique_name_iss);
      }
    }

    static decode(reader: Reader, length: i32): register_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new register_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.user = reader.bytes();
            break;

          case 2:
            message.sub = reader.string();
            break;

          case 3:
            message.iss = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    user: Uint8Array | null;
    sub: string | null;
    iss: string | null;

    constructor(
      user: Uint8Array | null = null,
      sub: string | null = null,
      iss: string | null = null
    ) {
      this.user = user;
      this.sub = sub;
      this.iss = iss;
    }
  }

  export class unregister_arguments {
    static encode(message: unregister_arguments, writer: Writer): void {
      const unique_name_user = message.user;
      if (unique_name_user !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_user);
      }

      const unique_name_sub = message.sub;
      if (unique_name_sub !== null) {
        writer.uint32(18);
        writer.string(unique_name_sub);
      }
    }

    static decode(reader: Reader, length: i32): unregister_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new unregister_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.user = reader.bytes();
            break;

          case 2:
            message.sub = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    user: Uint8Array | null;
    sub: string | null;

    constructor(user: Uint8Array | null = null, sub: string | null = null) {
      this.user = user;
      this.sub = sub;
    }
  }

  export class get_credentials_args {
    static encode(message: get_credentials_args, writer: Writer): void {
      const unique_name_user = message.user;
      if (unique_name_user !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_user);
      }
    }

    static decode(reader: Reader, length: i32): get_credentials_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_credentials_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.user = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    user: Uint8Array | null;

    constructor(user: Uint8Array | null = null) {
      this.user = user;
    }
  }

  export class get_credentials_result {
    static encode(message: get_credentials_result, writer: Writer): void {
      const unique_name_value = message.value;
      for (let i = 0; i < unique_name_value.length; ++i) {
        writer.uint32(10);
        writer.fork();
        credential.encode(unique_name_value[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_credentials_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_credentials_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value.push(credential.decode(reader, reader.uint32()));
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Array<credential>;

    constructor(value: Array<credential> = []) {
      this.value = value;
    }
  }

  export class get_address_by_sub_args {
    static encode(message: get_address_by_sub_args, writer: Writer): void {
      const unique_name_sub = message.sub;
      if (unique_name_sub !== null) {
        writer.uint32(10);
        writer.string(unique_name_sub);
      }
    }

    static decode(reader: Reader, length: i32): get_address_by_sub_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_address_by_sub_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.sub = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    sub: string | null;

    constructor(sub: string | null = null) {
      this.sub = sub;
    }
  }

  export class address {
    static encode(message: address, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): address {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new address();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Uint8Array | null;

    constructor(value: Uint8Array | null = null) {
      this.value = value;
    }
  }

  export class cert {
    static encode(message: cert, writer: Writer): void {
      const unique_name_public_key = message.public_key;
      if (unique_name_public_key !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_public_key);
      }

      const unique_name_iss = message.iss;
      if (unique_name_iss !== null) {
        writer.uint32(18);
        writer.string(unique_name_iss);
      }
    }

    static decode(reader: Reader, length: i32): cert {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new cert();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.public_key = reader.bytes();
            break;

          case 2:
            message.iss = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    public_key: Uint8Array | null;
    iss: string | null;

    constructor(
      public_key: Uint8Array | null = null,
      iss: string | null = null
    ) {
      this.public_key = public_key;
      this.iss = iss;
    }
  }

  export class get_cert_args {
    static encode(message: get_cert_args, writer: Writer): void {
      const unique_name_kid = message.kid;
      if (unique_name_kid !== null) {
        writer.uint32(10);
        writer.string(unique_name_kid);
      }
    }

    static decode(reader: Reader, length: i32): get_cert_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_cert_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.kid = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    kid: string | null;

    constructor(kid: string | null = null) {
      this.kid = kid;
    }
  }

  export class set_cert_args {
    static encode(message: set_cert_args, writer: Writer): void {
      const unique_name_user = message.user;
      if (unique_name_user !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_user);
      }

      const unique_name_kid = message.kid;
      if (unique_name_kid !== null) {
        writer.uint32(18);
        writer.string(unique_name_kid);
      }

      const unique_name_public_key = message.public_key;
      if (unique_name_public_key !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_public_key);
      }

      const unique_name_iss = message.iss;
      if (unique_name_iss !== null) {
        writer.uint32(34);
        writer.string(unique_name_iss);
      }
    }

    static decode(reader: Reader, length: i32): set_cert_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_cert_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.user = reader.bytes();
            break;

          case 2:
            message.kid = reader.string();
            break;

          case 3:
            message.public_key = reader.bytes();
            break;

          case 4:
            message.iss = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    user: Uint8Array | null;
    kid: string | null;
    public_key: Uint8Array | null;
    iss: string | null;

    constructor(
      user: Uint8Array | null = null,
      kid: string | null = null,
      public_key: Uint8Array | null = null,
      iss: string | null = null
    ) {
      this.user = user;
      this.kid = kid;
      this.public_key = public_key;
      this.iss = iss;
    }
  }
}
