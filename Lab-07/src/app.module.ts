import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishesModule } from './dishes/dishes.module.js';
import { DishEntity } from './dishes/entities/dish.entity.js';
import * as net from 'net';

const logger = new Logger('TypeOrmModule');

function checkPostgresPort(host: string, port: number, timeout = 600): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
      }),
      dataSourceFactory: async () => {
        const host = process.env['DB_HOST'] || 'localhost';
        const port = parseInt(process.env['DB_PORT'] || '5432', 10);
        const username = process.env['DB_USERNAME'] || 'nest_user';
        const password = process.env['DB_PASSWORD'] || 'nest_password';
        const database = process.env['DB_DATABASE'] || 'store_db';

        const isPgRunning = await checkPostgresPort(host, port);

        if (isPgRunning) {
          logger.log(`Database connection established successfully (PostgreSQL 16 на ${host}:${port})`);
          const { DataSource } = await import('typeorm');
          const ds = new DataSource({
            type: 'postgres',
            host,
            port,
            username,
            password,
            database,
            entities: [DishEntity],
            synchronize: true,
          });
          return await ds.initialize();
        }

        logger.warn(
          'PostgreSQL не виявлено на localhost:5432 (Docker не запущено). Активовано in-memory PostgreSQL (pg-mem) для тестування.'
        );

        const { newDb } = await import('pg-mem');
        const { randomUUID } = await import('crypto');

        const db = newDb({ autoCreateForeignKeyIndices: true });

        db.public.registerFunction({
          implementation: () => database,
          name: 'current_database',
        });
        db.public.registerFunction({
          implementation: () => 'PostgreSQL 16.0',
          name: 'version',
        });
        db.public.registerFunction({
          name: 'uuid_generate_v4',
          implementation: () => randomUUID(),
          impure: true,
        });
        db.public.registerFunction({
          name: 'gen_random_uuid',
          implementation: () => randomUUID(),
          impure: true,
        });
        db.registerExtension('uuid-ossp', (schema) => {
          schema.registerFunction({
            name: 'uuid_generate_v4',
            implementation: () => randomUUID(),
            impure: true,
          });
        });

        const ds = await db.adapters.createTypeormDataSource({
          type: 'postgres',
          entities: [DishEntity],
          synchronize: true,
        });

        await ds.initialize();
        logger.log('Database connection established successfully (PostgreSQL 16)');
        return ds;
      },
    }),
    DishesModule,
  ],
})
export class AppModule {}
