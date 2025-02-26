# **Mod Sign OpenID**

## **Overview**

ModSignOpenID is a module within the Veive protocol that enables signing transactions using OpenID authentication providers. OpenID Connect (OIDC) is an authentication protocol that allows users to verify their identity via third-party identity providers such as Google, Twitter, and other OpenID-compliant services. This module facilitates seamless integration with OpenID providers, allowing users to authenticate and sign transactions securely.

Full documentation: https://docs.veive.io/veive-docs/framework/core-modules/mod-sign-openid

## **Purpose**

OpenID Connect is a widely adopted authentication standard built on OAuth 2.0, enabling users to log in using their existing credentials from trusted identity providers. Instead of managing private keys directly, the authentication provider issues an ID token that can be used to verify the user's identity and confirm transaction signatures.

### **Key Components in OpenID Authentication**

- **ID Token**: A JWT (JSON Web Token) issued by the OpenID provider, containing claims about the user’s identity and authentication status.
- **Nonce**: A unique challenge used to prevent replay attacks and ensure the request’s integrity.
- **Signature**: A cryptographic signature on the ID token that verifies its authenticity.

### **How ModSignOpenID Works**

1. **Authentication & Token Retrieval**:
   - The user authenticates via an OpenID provider, obtaining an ID token.
   - The ID token contains claims that verify the user's identity.

2. **Signature Validation**:
   - When a transaction is signed using OpenID, the `is_valid_signature` method is called to validate the signature. This method checks if the signature is valid by:
     - Decoding the ID token to extract claims such as `sub` (subject), `iss` (issuer), and `nonce`.
     - Retrieving the public key from the OpenID provider's JWKS endpoint.
     - Verifying the signature of the ID token using the OpenID provider’s public key.
     - Ensuring the `nonce` matches the expected transaction hash.

This module does not perform cryptographic checks directly but delegates this responsibility to a verifier contract specified by `VERIFIER_CONTRACT_ID`. This modular approach allows for the integration of different OpenID providers while keeping the ModSignOpenID module focused on authentication and identity validation.

## **Usage**

### **Installation**

To install the ModSignOpenID module, first ensure that the Veive protocol is set up on your Koinos blockchain environment. Install the module using yarn:

```bash
yarn add @veive-io/mod-sign-openid-as
```

Deploy the module contract on the Koinos blockchain and install it on the desired account using the `install_module` method provided by the Veive account interface. The `on_install` method initializes necessary settings, including the account ID.

### **Scripts**

#### Build

To compile the package, run:

```bash
yarn build
```

#### Dist

To create a distribution, run:

```bash
yarn dist
```

#### Test

To test the package, use:

```bash
yarn jest
```

## **Contributing**

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/veiveprotocol).

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.

