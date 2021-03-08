import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service";

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
})

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
}

const mockMailService = {
  sendVerificationEmail: jest.fn()
}

type MockRepository<T = any> = Partial<Record<keyof Repository<User>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;

  // 테스트 모듈 생성
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository()
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository()
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: MailService,
          useValue: mockMailService
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  })

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'testmail@email.com',
      password: 'pw1234',
      role: 0
    };

    // 유저가 존재하면 실패
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@email.com'
      })
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: '해당 이메일을 가진 사용자가 이미 존재합니다.'
      });
    });

    it('should create a new user', async () => {
      // 사전 처리
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({ user: createAccountArgs });
      verificationsRepository.save.mockResolvedValue({ code: 'code' });

      // 수행
      const result = await service.createAccount(createAccountArgs);

      // 결과 검증
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({ user: createAccountArgs });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({ user: createAccountArgs });
      
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));
      expect(result).toEqual({ ok: true });
    })
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
})