import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Crypto } from './crypto.enum';

require('dotenv').config();

const { ENCRYPTION_IV, ENCRYPTION_KEY, ENCRYPTION_METHOD } = process.env

@Injectable()
export class CryptoService {
  private key = this.createHash(ENCRYPTION_KEY, 32);
  private iv = this.createHash(ENCRYPTION_IV, 16); 

  /**
   * Creates a hash based on the provided data and hash length.
   *
   * @param data - The data to be hashed.
   * @param hashLength - The length of the resulting hash.
   * @returns The hashed string.
   */
  private createHash(data: string, hashLength: number): string {
    console.log(ENCRYPTION_KEY);
    console.log(ENCRYPTION_IV);
    
    return crypto
      .createHash(Crypto.HASH_ALGORITHM)
      .update(data, Crypto.HASH_INPUT_ENCODING)
      .digest(Crypto.HASH_DIGEST_ENCODING)
      .substring(0, hashLength);
  }

  /**
   * Encrypts the provided plain text using AES encryption.
   *
   * @param plain_text - The plain text to be encrypted.
   * @returns The encrypted text.
   */
  encrypt(plain_text: string): string {
    const encryptor = crypto.createCipheriv(ENCRYPTION_METHOD, this.key, this.iv);
    const aes_encrypted =
      encryptor.update(plain_text, Crypto.ENCRYPT_INPUT_ENCODING, Crypto.ENCRYPT_OUTPUT_ENCODING) +
      encryptor.final(Crypto.ENCRYPT_OUTPUT_ENCODING);

    return Buffer.from(aes_encrypted).toString(Crypto.ENCRYPT_OUTPUT_ENCODING);
  }

  /**
   * Decrypts the provided encrypted string using AES decryption.
   *
   * @param encrypted_string - The encrypted string to be decrypted.
   * @returns The decrypted plain text.
   */
  decrypt(encrypted_string: string): string {
    const buff = Buffer.from(encrypted_string, Crypto.ENCRYPT_OUTPUT_ENCODING);

    encrypted_string = buff.toString(Crypto.DECRYPT_OUTPUT_ENCODING);

    const decryptor = crypto.createDecipheriv(ENCRYPTION_METHOD, this.key, this.iv);

    return (
      decryptor.update(encrypted_string, Crypto.DECRYPT_INPUT_ENCODING, Crypto.DECRYPT_OUTPUT_ENCODING) +
      decryptor.final(Crypto.DECRYPT_OUTPUT_ENCODING)
    );
  }
}
