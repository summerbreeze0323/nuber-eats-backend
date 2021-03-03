import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn() // 자동으로 설정해주는 column
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}