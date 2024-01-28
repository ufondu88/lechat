import { Test, TestingModule } from '@nestjs/testing';
import { Crypto } from './crypto.enum';
import { CryptoService } from './crypto.service';

// Mock the dotenv configuration
require('dotenv').config();

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(async () => {

    process.env.ENCRYPTION_IV = 'iv';
    process.env.ENCRYPTION_KEY = 'key';
    process.env.ENCRYPTION_METHOD = 'AES-256-CBC';

    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    cryptoService = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(cryptoService).toBeDefined();
  });

  it('should encrypt and decrypt a string', () => {
    const plainText = 'This is a secret message';

    const encryptedText = cryptoService.encrypt(plainText);
    const decryptedText = cryptoService.decrypt(encryptedText);

    expect(encryptedText).toBeDefined();
    expect(decryptedText).toEqual(plainText);
  });

  it('should throw an error when trying to decrypt an invalid string', () => {
    const invalidEncryptedString = 'InvalidEncryptedString';

    expect(() => cryptoService.decrypt(invalidEncryptedString)).toThrowError();
  });

  it('should have the correct values in the Crypto enum', () => {
    expect(Crypto.HASH_ALGORITHM).toEqual('sha512');
    expect(Crypto.ENCRYPT_INPUT_ENCODING).toEqual('utf-8');
    expect(Crypto.ENCRYPT_OUTPUT_ENCODING).toEqual('base64');
    expect(Crypto.DECRYPT_INPUT_ENCODING).toEqual(Crypto.ENCRYPT_OUTPUT_ENCODING);
    expect(Crypto.DECRYPT_OUTPUT_ENCODING).toEqual(Crypto.ENCRYPT_INPUT_ENCODING);
    expect(Crypto.HASH_INPUT_ENCODING).toEqual(Crypto.ENCRYPT_INPUT_ENCODING);
    expect(Crypto.HASH_DIGEST_ENCODING).toEqual('hex');
  });
});