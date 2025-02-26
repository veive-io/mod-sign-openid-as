# **Mod Sign OpenID**

## **Overview**

ModSignOpenID is a module within the Veive protocol that enables signing transactions using OpenID authentication providers. OpenID Connect (OIDC) is an authentication protocol that allows users to verify their identity via third-party identity providers such as Google, Twitter, and other OpenID-compliant services. This module facilitates seamless integration with OpenID providers, allowing users to authenticate and sign transactions securely.

Full documentation: https://docs.veive.io/veive-docs/framework/core-modules/mod-sign-openid

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

