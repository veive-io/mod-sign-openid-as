import { Buffer } from "buffer";
import * as crypto from "crypto";

// Chiave pubblica di Google (n ed e)
const e = "AQAB";
const n = "uac7NRcojCutcceWq1nrpLGJjQ7ywvgWsUcb1DWMKJ3KNNHiRzh9jshoi9tmq1zlarJ_h7GQg8iU1qD7SgpVYJmjlKG1MNVRAtuNrNMC0UAnNfG7mBBNorHFndfp-9cLTiMjXSXRzhNqiMvTVKeolRdMB2lH9RzJnwlpXtvUbD7M1pXOlPlMaOy1zxUnHn0uszU5mPRQk79i03BNrAdhwrAUB-ZuMnqpjaUcb9VU3KIwuZNPtsVenLN12sRYpaZ6WBw8Q9q7fAoaJUovM0Go8deC9pJYyxJuHdVo9HP0osyzg3g_rOYi14wmvMBuiDf3F4pTnudAfFyl3d0Mn_i4ZQ";

// Decodifica Base64URL → Buffer
function decodeBase64Url(base64Url) {
    return Buffer.from(base64Url.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

// Converti `e` da Base64URL a numero intero
function decodeExponent(exp) {
    return parseInt(Buffer.from(exp, "base64").toString("hex"), 16);
}

// Convertiamo `n` e `e` per creare la chiave pubblica RSA
const modulus = decodeBase64Url(n);
const exponent = decodeExponent(e);

// Costruisci la chiave pubblica RSA
const key = crypto.createPublicKey({
    key: {
        n: modulus,
        e: exponent,
        kty: "RSA",
    },
    format: "jwk",
});

// Esporta la chiave in formato PEM
const publicKeyPEM = key.export({ type: "spki", format: "pem" });

console.log("Chiave pubblica PEM:\n", publicKeyPEM);
