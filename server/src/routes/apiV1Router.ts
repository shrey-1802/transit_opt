import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { vehicleController } from '../controllers/vehicleController.js';
import { driverController } from '../controllers/driverController.js';
import { tripController } from '../controllers/tripController.js';
import {
  maintenanceController,
  fuelController,
  analyticsController,
  alertController,
  copilotController,
  reportController,
} from '../controllers/maintenanceController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';

import { loginSchema } from '../schemas/authSchema.js';
import { createVehicleSchema, updateVehicleSchema } from '../schemas/vehicleSchema.js';
import { createDriverSchema, suspendDriverSchema } from '../schemas/driverSchema.js';
import { validateDispatchSchema, dispatchTripSchema, completeTripSchema, cancelTripSchema } from '../schemas/tripSchema.js';
import { createMaintenanceSchema, logFuelSchema, logExpenseSchema, copilotQuerySchema } from '../schemas/maintenanceSchema.js';

export const apiV1Router = Router();

// Health Check
apiV1Router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Authentication
apiV1Router.post('/auth/login', validateBody(loginSchema), authController.login);
apiV1Router.get('/auth/me', authMiddleware, authController.me);
apiV1Router.post('/auth/logout', authController.logout);

// Vehicles (Fleet Manager CRUD)
apiV1Router.get('/vehicles', vehicleController.getAll);
apiV1Router.get('/vehicles/:id', vehicleController.getById);
apiV1Router.get('/vehicles/:id/digital-twin', vehicleController.getDigitalTwin);
apiV1Router.post('/vehicles', authMiddleware, requireRoles('fleet_manager'), validateBody(createVehicleSchema), vehicleController.create);
apiV1Router.put('/vehicles/:id', authMiddleware, requireRoles('fleet_manager'), validateBody(updateVehicleSchema), vehicleController.update);
apiV1Router.delete('/vehicles/:id', authMiddleware, requireRoles('fleet_manager'), vehicleController.delete);
apiV1Router.post('/vehicles/:id/documents', authMiddleware, requireRoles('fleet_manager'), vehicleController.addDocument);

// Drivers (Safety Officer controls)
apiV1Router.get('/drivers', driverController.getAll);
apiV1Router.get('/drivers/:id', driverController.getById);
apiV1Router.post('/drivers', authMiddleware, requireRoles('safety_officer', 'fleet_manager'), validateBody(createDriverSchema), driverController.create);
apiV1Router.post('/drivers/:id/suspend', authMiddleware, requireRoles('safety_officer'), validateBody(suspendDriverSchema), driverController.suspend);
apiV1Router.post('/drivers/:id/reinstate', authMiddleware, requireRoles('safety_officer'), driverController.reinstate);

// Trips & Smart Dispatch (Dispatcher controls)
apiV1Router.get('/trips', tripController.getAll);
apiV1Router.post('/trips/validate-dispatch', validateBody(validateDispatchSchema), tripController.validateDispatch);
apiV1Router.post('/trips/dispatch', authMiddleware, requireRoles('dispatcher'), validateBody(dispatchTripSchema), tripController.dispatch);
apiV1Router.post('/trips/:id/complete', authMiddleware, requireRoles('dispatcher'), validateBody(completeTripSchema), tripController.complete);
apiV1Router.post('/trips/:id/cancel', authMiddleware, requireRoles('dispatcher'), validateBody(cancelTripSchema), tripController.cancel);

// Maintenance (Fleet Manager)
apiV1Router.get('/maintenance', maintenanceController.getAll);
apiV1Router.post('/maintenance', authMiddleware, requireRoles('fleet_manager'), validateBody(createMaintenanceSchema), maintenanceController.create);
apiV1Router.post('/maintenance/:id/close', authMiddleware, requireRoles('fleet_manager'), maintenanceController.close);

// Fuel & Expenses (Financial Analyst)
apiV1Router.get('/fuel', fuelController.getAll);
apiV1Router.post('/fuel', authMiddleware, requireRoles('financial_analyst', 'fleet_manager'), validateBody(logFuelSchema), fuelController.logFuel);
apiV1Router.get('/expenses', fuelController.getExpenses);
apiV1Router.get('/expenses/summary', fuelController.getCostSummary);
apiV1Router.post('/expenses', authMiddleware, requireRoles('financial_analyst'), validateBody(logExpenseSchema), fuelController.logExpense);

// Analytics & Reports
apiV1Router.get('/analytics/dashboard-kpis', analyticsController.getDashboardKPIs);
apiV1Router.get('/analytics/roi-trends', analyticsController.getRoiTrends);
apiV1Router.get('/analytics/fuel-trends', analyticsController.getFuelTrends);
apiV1Router.get('/analytics/maintenance-trends', analyticsController.getMaintenanceTrends);
apiV1Router.get('/analytics/rankings', analyticsController.getVehicleRoiRankings);
apiV1Router.get('/reports/export-csv', authMiddleware, requireRoles('financial_analyst', 'fleet_manager'), reportController.exportCsv);

// Alerts Center
apiV1Router.get('/alerts', alertController.getAll);
apiV1Router.post('/alerts/:id/read', alertController.markAsRead);

// AI Copilot
apiV1Router.post('/copilot/query', validateBody(copilotQuerySchema), copilotController.query);
