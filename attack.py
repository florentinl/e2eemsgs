import base64


def xor_bytes(b1: bytes, b2: bytes):
    return bytes(a ^ b for a, b in zip(b1, b2))


def decrypt_message(msg: str):
    message = base64.b64decode(msg)

    with open(
        "anssi_amrae-guide-maitrise_risque_numerique-atout_confiance.pdf", "rb"
    ) as file:
        known_plaintext = file.read(len(message))

    with open("anssi_encrypted.pdf", "r") as file:
        encrypted_file = base64.b64decode(file.read())
        known_ciphertext = encrypted_file[: len(message)]

    decrypted = xor_bytes(known_plaintext, xor_bytes(known_ciphertext, message))
    decrypted_without_tag = decrypted[: len(decrypted) - 16]

    return decrypted_without_tag.decode()


if __name__ == "__main__":
    message = "sMXzH98w7KIt6T5uPMwSgZ8veXgcFnf0xT/s2pdudAdLgiI56egnUOXafTHbczT6rYo5/A=="
    print(decrypt_message(message))
