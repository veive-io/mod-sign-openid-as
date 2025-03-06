#!/usr/bin/env python3
import sys
import struct
import base64
from Crypto.PublicKey import RSA
from Crypto.Util.number import long_to_bytes, inverse, bytes_to_long

def pem_to_rsa_struct_bytes(pem_filename, key_size=2048):
    # Carica la chiave RSA dal file PEM
    with open(pem_filename, "r") as f:
        key = RSA.import_key(f.read())
    
    n_int = key.n
    num_bytes = key_size // 8  # per RSA2048 -> 256 byte
    n_bytes = long_to_bytes(n_int, num_bytes)  # modulo in big-endian
    
    # Dividi in blocchi di 4 byte (non invertire l'ordine interno dei byte)
    blocks = [n_bytes[i:i+4] for i in range(0, len(n_bytes), 4)]
    # Per ottenere l'array little-endian, inverti l'ordine dei blocchi
    blocks.reverse()
    n_words = [int.from_bytes(block, byteorder='big') for block in blocks]
    
    # Calcola n0inv = (-1 / n[0]) mod 2^32 usando il primo word (che ora è il blocco meno significativo)
    n0 = n_words[0]
    n0inv = (-inverse(n0, 1 << 32)) % (1 << 32)
    
    # Calcola rr = (R^2 mod n), con R = 2^(key_size)
    R = 1 << key_size
    rr_int = (R * R) % n_int
    rr_bytes = long_to_bytes(rr_int, num_bytes)
    rr_blocks = [rr_bytes[i:i+4] for i in range(0, len(rr_bytes), 4)]
    rr_blocks.reverse()
    rr_words = [int.from_bytes(block, byteorder='big') for block in rr_blocks]
    
    # Costruisci il buffer secondo il layout della struttura:
    #   size (4 byte) | n0inv (4 byte) | n (256 byte) | rr (256 byte) = 520 byte totali
    result = bytearray()
    # Campo size: 64 (0x40) in little-endian (il numero di parole)
    result.extend(struct.pack("<I", len(n_words)))
    # Campo n0inv:
    result.extend(struct.pack("<I", n0inv))
    # Campo n: 64 parole, ciascuna in little-endian
    for word in n_words:
        result.extend(struct.pack("<I", word))
    # Campo rr: 64 parole, ciascuna in little-endian
    for word in rr_words:
        result.extend(struct.pack("<I", word))
    
    return bytes(result)

def to_base64url(data_bytes):
    # Codifica in base64 standard
    b64 = base64.b64encode(data_bytes).decode('ascii')
    # Converti in base64url sostituendo '+'->'-' e '/'->'_', rimuovendo '=' finali
    b64url = b64.replace('+', '-').replace('/', '_').rstrip('=')
    return b64url

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: {} <key.pem>".format(sys.argv[0]))
        sys.exit(1)
    
    rsa_struct_bytes = pem_to_rsa_struct_bytes(sys.argv[1])
    rsa_b64url = to_base64url(rsa_struct_bytes)
    
    print("Base64url representation of rsa_public_key structure:")
    print(rsa_b64url)
