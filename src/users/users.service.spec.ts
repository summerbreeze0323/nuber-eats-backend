import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service";

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
}

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

  // 테스트 모듈 생성
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository
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

    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  })

  describe('createAccount', () => {
    // 유저가 존재하면 실패
    it('should fail if user exists', () => {
      
    })
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
})