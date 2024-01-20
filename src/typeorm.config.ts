import { TypeOrmModuleOptions } from "@nestjs/typeorm";

require('dotenv').config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env['POSTGRES_HOST'],
  port: +process.env['POSTGRES_PORT'],
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_DATABASE'],
  entities: [__dirname + '/../**/*.entity.js'],
  synchronize: true // set to false for production 
}