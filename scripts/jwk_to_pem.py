import sys
import json
import base64
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def b64url_decode(data):
    # Aggiungi padding se necessario
    rem = len(data) % 4
    if rem:
        data += '=' * (4 - rem)
    return base64.urlsafe_b64decode(data)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python3 jwk_to_pem.py <jwk.json>")
        sys.exit(1)
    
    # Carica il file JSON contenente il JWK
    with open(sys.argv[1], "r") as f:
        jwk = json.load(f)
    
    # Estrai i campi "e" e "n" dal JWK
    e_str = jwk["e"]
    n_str = jwk["n"]
    
    # Decodifica dal formato base64url
    e_bytes = b64url_decode(e_str)
    n_bytes = b64url_decode(n_str)
    
    # Converti i byte in interi (big-endian)
    e_int = int.from_bytes(e_bytes, byteorder='big')
    n_int = int.from_bytes(n_bytes, byteorder='big')
    
    # Crea l'oggetto RSA public key
    public_numbers = rsa.RSAPublicNumbers(e_int, n_int)
    public_key = public_numbers.public_key()
    
    # Esporta la chiave pubblica in formato PEM
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    print(pem.decode())
