import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';
import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { CarsController } from '../src/cars/cars.controller.js';
import { CarsService } from '../src/cars/cars.service.js';
import { FuelController } from '../src/fuel/fuel.controller.js';
import { FuelService } from '../src/fuel/fuel.service.js';
import { MaintenanceController } from '../src/maintenance/maintenance.controller.js';
import { MaintenanceService } from '../src/maintenance/maintenance.service.js';

describe('API endpoints (e2e)', () => {
  let app: INestApplication;
  const appService = { getHello: vi.fn(() => 'Hello World!') };
  const authService = {
    register: vi.fn(),
    login: vi.fn(),
    getProfile: vi.fn(),
  };
  const carsService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const maintenanceService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const fuelService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const user = {
    userId: '507f1f77bcf86cd799439011',
    email: 'driver@example.com',
  };
  const carId = '507f1f77bcf86cd799439012';
  const recordId = '507f1f77bcf86cd799439013';
  const validAuthGuard = {
    canActivate: (context: {
      switchToHttp: () => {
        getRequest: () => {
          headers: Record<string, string | undefined>;
          user?: typeof user;
        };
      };
    }) => {
      const req = context.switchToHttp().getRequest();
      if (req.headers.authorization !== 'Bearer test-jwt') {
        throw new UnauthorizedException();
      }
      req.user = user;
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AppController,
        AuthController,
        CarsController,
        MaintenanceController,
        FuelController,
      ],
      providers: [
        { provide: AppService, useValue: appService },
        { provide: AuthService, useValue: authService },
        { provide: CarsService, useValue: carsService },
        { provide: MaintenanceService, useValue: maintenanceService },
        { provide: FuelService, useValue: fuelService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(validAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / returns the root response', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /auth/register validates and forwards registration data', async () => {
    authService.register.mockResolvedValue({
      _id: user.userId,
      email: user.email,
      username: 'driver',
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: user.email, password: 'password123', username: 'driver' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.data.email).toBe(user.email);
      });

    expect(authService.register).toHaveBeenCalledWith({
      email: user.email,
      password: 'password123',
      username: 'driver',
    });
  });

  it('POST /auth/register rejects invalid input', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invalid', password: '123', username: 'x' })
      .expect(400);
  });

  it('POST /auth/login returns the controller login shape', async () => {
    authService.login.mockResolvedValue({ access_token: 'test-jwt' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'password123' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.data.access_token).toBe('test-jwt');
      });
  });

  it('GET /auth/profile requires a JWT and returns the user profile', async () => {
    authService.getProfile.mockResolvedValue({
      _id: user.userId,
      email: user.email,
      username: 'driver',
    });

    await request(app.getHttpServer()).get('/auth/profile').expect(401);
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', 'Bearer test-jwt')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.email).toBe(user.email);
      });
  });

  it('GET /cars and GET /cars?brand filter are JWT-protected', async () => {
    carsService.findAll.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/cars').expect(401);
    await request(app.getHttpServer())
      .get('/cars')
      .set('Authorization', 'Bearer test-jwt')
      .expect(200)
      .expect([]);
    await request(app.getHttpServer())
      .get('/cars?brand=Toyota')
      .set('Authorization', 'Bearer test-jwt')
      .expect(200)
      .expect([]);

    expect(carsService.findAll).toHaveBeenNthCalledWith(1, user.userId, undefined);
    expect(carsService.findAll).toHaveBeenNthCalledWith(2, user.userId, 'Toyota');
  });

  it('GET, POST, PATCH, and DELETE /cars routes are wired to the service', async () => {
    carsService.findOne.mockResolvedValue({ _id: carId });
    carsService.create.mockResolvedValue({ _id: carId });
    carsService.update.mockResolvedValue({ _id: carId, model: 'Camry' });
    carsService.remove.mockResolvedValue({ _id: carId });
    const auth = { Authorization: 'Bearer test-jwt' };

    await request(app.getHttpServer())
      .get(`/cars/${carId}`)
      .set(auth)
      .expect(200);
    await request(app.getHttpServer())
      .post('/cars')
      .set(auth)
      .send({ brand: 'Toyota', model: 'Corolla', year: 2024, PlateNum: 'ABC-1' })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/cars/${carId}`)
      .set(auth)
      .send({ model: 'Camry' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/cars/${carId}`)
      .set(auth)
      .expect(200);
    await request(app.getHttpServer())
      .post('/cars')
      .set(auth)
      .send({ brand: 'Toyota' })
      .expect(400);

    expect(carsService.findOne).toHaveBeenCalledWith(carId, user.userId);
    expect(carsService.create).toHaveBeenCalledWith(user.userId, {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      PlateNum: 'ABC-1',
    });
    expect(carsService.update).toHaveBeenCalledWith(carId, user.userId, {
      model: 'Camry',
    });
    expect(carsService.remove).toHaveBeenCalledWith(carId, user.userId);
  });

  it('exposes all Maintenance routes with authenticated ownership context', async () => {
    const dto = {
      type: 'Oil Change',
      description: 'Changed oil',
      date: '2025-01-15',
      odometer: 45000,
    };
    maintenanceService.create.mockResolvedValue({ _id: recordId });
    maintenanceService.findAll.mockResolvedValue([]);
    maintenanceService.findOne.mockResolvedValue({ _id: recordId });
    maintenanceService.update.mockResolvedValue({ _id: recordId });
    maintenanceService.remove.mockResolvedValue({ _id: recordId });
    const auth = { Authorization: 'Bearer test-jwt' };

    await request(app.getHttpServer())
      .get(`/cars/${carId}/maintenance`)
      .expect(401);
    await request(app.getHttpServer())
      .post(`/cars/${carId}/maintenance`)
      .set(auth)
      .send(dto)
      .expect(201);
    await request(app.getHttpServer())
      .get(`/cars/${carId}/maintenance`)
      .set(auth)
      .expect(200)
      .expect([]);
    await request(app.getHttpServer())
      .get(`/maintenance/${recordId}`)
      .set(auth)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/maintenance/${recordId}`)
      .set(auth)
      .send({ description: 'Updated service' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/maintenance/${recordId}`)
      .set(auth)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/cars/${carId}/maintenance`)
      .set(auth)
      .send({ ...dto, odometer: -1 })
      .expect(400);

    expect(maintenanceService.create).toHaveBeenCalledWith(carId, user.userId, dto);
    expect(maintenanceService.findAll).toHaveBeenCalledWith(carId, user.userId);
    expect(maintenanceService.findOne).toHaveBeenCalledWith(recordId, user.userId);
    expect(maintenanceService.update).toHaveBeenCalledWith(
      recordId,
      user.userId,
      { description: 'Updated service' },
    );
    expect(maintenanceService.remove).toHaveBeenCalledWith(recordId, user.userId);
  });

  it('exposes all Fuel log routes with car IDs kept out of create bodies', async () => {
    const dto = {
      isFullTank: true,
      fuelAmount: 40,
      totalCost: 60,
      fuelPriceAmount: 1.5,
      odometerReading: 45000,
    };
    fuelService.create.mockResolvedValue({ _id: recordId });
    fuelService.findAll.mockResolvedValue([]);
    fuelService.findOne.mockResolvedValue({ _id: recordId });
    fuelService.update.mockResolvedValue({ _id: recordId });
    fuelService.remove.mockResolvedValue({ _id: recordId });
    const auth = { Authorization: 'Bearer test-jwt' };

    await request(app.getHttpServer())
      .get(`/cars/${carId}/fuel-logs`)
      .expect(401);
    await request(app.getHttpServer())
      .post(`/cars/${carId}/fuel-logs`)
      .set(auth)
      .send(dto)
      .expect(201);
    await request(app.getHttpServer())
      .get(`/cars/${carId}/fuel-logs`)
      .set(auth)
      .expect(200)
      .expect([]);
    await request(app.getHttpServer())
      .get(`/fuel-logs/${recordId}`)
      .set(auth)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/fuel-logs/${recordId}`)
      .set(auth)
      .send({ totalCost: 70 })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/fuel-logs/${recordId}`)
      .set(auth)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/cars/${carId}/fuel-logs`)
      .set(auth)
      .send({ ...dto, fuelAmount: -1 })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/cars/${carId}/fuel-logs`)
      .set(auth)
      .send({ ...dto, carId })
      .expect(201);

    expect(fuelService.create).toHaveBeenCalledWith(carId, user.userId, dto);
    expect(fuelService.create).toHaveBeenLastCalledWith(carId, user.userId, dto);
    expect(fuelService.findAll).toHaveBeenCalledWith(carId, user.userId);
    expect(fuelService.findOne).toHaveBeenCalledWith(recordId, user.userId);
    expect(fuelService.update).toHaveBeenCalledWith(
      recordId,
      user.userId,
      { totalCost: 70 },
    );
    expect(fuelService.remove).toHaveBeenCalledWith(recordId, user.userId);
  });
});
