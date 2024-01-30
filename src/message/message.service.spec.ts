import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatUserService } from '../chat-user/chat-user.service';
import { ChatroomService } from '../chatroom/chatroom.service';
import { CryptoService } from '../crypto/crypto.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChatUser } from 'chat-user/entities/chat-user.entity';
import { ChatRoom } from 'chatroom/entities/chatroom.entity';

describe('MessageService', () => {
  let service: MessageService;
  let messageRepo: Repository<Message>;
  let chatUserService: ChatUserService;
  let chatroomService: ChatroomService;
  let cryptoService: CryptoService;
  let spyLoggerError: jest.SpyInstance
  let createSpy: jest.SpyInstance
  let saveSpy: jest.SpyInstance

  const MESSAGE_REPO_TOKEN = getRepositoryToken(Message);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MESSAGE_REPO_TOKEN,
          useClass: Repository,
        },
        {
          provide: ChatUserService,
          useValue: {
            findOneByID: jest.fn(),
          },
        },
        {
          provide: ChatroomService,
          useValue: {
            findOne: jest.fn(),
            userIsInChatroom: jest.fn(),
            validateChatroom: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MessageService);
    messageRepo = module.get(MESSAGE_REPO_TOKEN);
    chatUserService = module.get(ChatUserService);
    chatroomService = module.get(ChatroomService);
    cryptoService = module.get(CryptoService);

    spyLoggerError = jest.spyOn(service.logger, 'error');
    createSpy = jest.spyOn(messageRepo, 'create')
    saveSpy = jest.spyOn(messageRepo, 'save')
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createMessageDto: CreateMessageDto = {
      sender: 'senderId',
      value: 'plain_text',
      chatroomId: 'chatroomId',
    };
    const chatSender: ChatUser = { id: 'senderId', externalId: 'externalId' };
    const chatroom: ChatRoom = { id: 'chatroomId', users: [], messages: [] };

    const message: Message = {
      id: '1',
      sender: chatSender,
      chatroom,
      value: createMessageDto.value
    }

    it('should create a new message', async () => { 
      jest.spyOn(service, 'validateUser').mockResolvedValue(chatSender);
      jest.spyOn(service, 'validateChatroom').mockResolvedValue(chatroom);
      jest.spyOn(service, 'validateUserInChatroom').mockResolvedValue(true);
      jest.spyOn(cryptoService, 'encrypt').mockReturnValue('encryptedValue');
      jest.spyOn(messageRepo, 'create').mockReturnValue(message);
      jest.spyOn(messageRepo, 'save').mockResolvedValue(message);

      const result = await service.create(createMessageDto);

      expect(result).toEqual(message);
      expect(messageRepo.create).toHaveBeenCalledWith({ value: 'encryptedValue', sender: chatSender, chatroom });
      expect(messageRepo.save).toHaveBeenCalledWith(message);
    });

    it('should throw NotFoundException if sender is not found', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(undefined)
      const validateChatroomSpy = jest.spyOn(service, 'validateChatroom')
      const validateUserInChatroomspy = jest.spyOn(service, 'validateUserInChatroom')

      try {
        await service.create(createMessageDto);
      } catch (error) {        
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error")); 
      }
      
      expect(validateChatroomSpy).not.toHaveBeenCalled();
      expect(validateUserInChatroomspy).not.toHaveBeenCalled();
      expect(cryptoService.encrypt).not.toHaveBeenCalled();
      expect(createSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if chatroom is not found', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(chatSender);
      jest.spyOn(service, 'validateChatroom').mockResolvedValue(undefined);

      try {
        await service.create(createMessageDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      expect(createSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if sender is not part of the chatroom', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(chatSender);
      jest.spyOn(service, 'validateChatroom').mockResolvedValue(chatroom);
      jest.spyOn(service, 'validateUserInChatroom').mockResolvedValue(false);

      try {
        await service.create(createMessageDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain("not part");
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }
      
      expect(createSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('findAllByChatroom', () => {
    it('should retrieve all messages for a specific chatroom', async () => {
      const chatroomId = 'chatroomId';
      const messages = [
        { value: 'encryptedValue1', chatroom: { id: 'chatroomId' } } as Message,
        { value: 'encryptedValue2', chatroom: { id: 'chatroomId' } } as Message,
      ];

      jest.spyOn(messageRepo, 'find').mockResolvedValue(messages);
      jest.spyOn(service, 'decrypted').mockReturnValue(messages);

      const result = await service.findAllByChatroom(chatroomId);

      expect(result).toEqual(messages);
      expect(messageRepo.find).toHaveBeenCalledWith({
        relations: ['chatroom'],
        where: { chatroom: { id: chatroomId } },
      });
      expect(service.decrypted).toHaveBeenCalledWith(messages);
    });
  });

  describe('decrypted', () => {
    it('should return decrypted messages', async () => {
      const encryptedMessages = [
        { value: 'encryptedValue1' } as Message,
        { value: 'encryptedValue2' } as Message,
      ];

      const decryptedMessages = [
        { value: 'decryptedValue1' } as Message,
        { value: 'decryptedValue2' } as Message,
      ];

      jest.spyOn(cryptoService, 'decrypt').mockReturnValueOnce('decryptedValue1').mockReturnValueOnce('decryptedValue2');

      const result = service.decrypted(encryptedMessages);

      expect(result).toEqual(decryptedMessages);
      expect(cryptoService.decrypt).toHaveBeenCalledWith('encryptedValue1');
      expect(cryptoService.decrypt).toHaveBeenCalledWith('encryptedValue2');
    });
  });
});
