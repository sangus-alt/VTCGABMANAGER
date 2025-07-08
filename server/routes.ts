import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertDriverSchema, insertVehicleSchema, insertClientSchema, 
  insertBookingSchema, insertPaymentSchema, insertFuelRecordSchema,
  insertMaintenanceRecordSchema, insertGpsTrackingSchema 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const broadcastToClients = (message: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different message types
        switch (data.type) {
          case 'gps_update':
            // Broadcast GPS updates to all connected clients
            broadcastToClients({
              type: 'gps_update',
              data: data.data
            });
            break;
          case 'booking_update':
            // Broadcast booking updates
            broadcastToClients({
              type: 'booking_update',
              data: data.data
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/dashboard/payment-summary', async (req, res) => {
    try {
      const paymentSummary = await storage.getPaymentSummary();
      res.json(paymentSummary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Users routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Drivers routes
  app.get('/api/drivers', async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/drivers/:id', async (req, res) => {
    try {
      const driver = await storage.getDriver(parseInt(req.params.id));
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      res.json(driver);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/drivers', upload.fields([
    { name: 'licensePhoto', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const driverData = insertDriverSchema.parse(req.body);
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.licensePhoto) {
        driverData.licensePhotoUrl = `/uploads/${files.licensePhoto[0].filename}`;
      }
      if (files.profilePhoto) {
        driverData.profilePhotoUrl = `/uploads/${files.profilePhoto[0].filename}`;
      }

      const driver = await storage.createDriver(driverData);
      res.status(201).json(driver);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/drivers/:id', upload.fields([
    { name: 'licensePhoto', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const driverData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (files.licensePhoto) {
        driverData.licensePhotoUrl = `/uploads/${files.licensePhoto[0].filename}`;
      }
      if (files.profilePhoto) {
        driverData.profilePhotoUrl = `/uploads/${files.profilePhoto[0].filename}`;
      }

      const driver = await storage.updateDriver(parseInt(req.params.id), driverData);
      res.json(driver);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/drivers/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const driver = await storage.updateDriverStatus(parseInt(req.params.id), status);
      
      // Broadcast driver status update
      broadcastToClients({
        type: 'driver_status_update',
        data: { driverId: driver.id, status: driver.status }
      });
      
      res.json(driver);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Vehicles routes
  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/vehicles', upload.fields([
    { name: 'registrationPhoto', maxCount: 1 },
    { name: 'vehiclePhoto', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.registrationPhoto) {
        vehicleData.registrationPhotoUrl = `/uploads/${files.registrationPhoto[0].filename}`;
      }
      if (files.vehiclePhoto) {
        vehicleData.vehiclePhotoUrl = `/uploads/${files.vehiclePhoto[0].filename}`;
      }

      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/vehicles/:id', upload.fields([
    { name: 'registrationPhoto', maxCount: 1 },
    { name: 'vehiclePhoto', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const vehicleData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (files.registrationPhoto) {
        vehicleData.registrationPhotoUrl = `/uploads/${files.registrationPhoto[0].filename}`;
      }
      if (files.vehiclePhoto) {
        vehicleData.vehiclePhotoUrl = `/uploads/${files.vehiclePhoto[0].filename}`;
      }

      const vehicle = await storage.updateVehicle(parseInt(req.params.id), vehicleData);
      res.json(vehicle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bookings routes
  app.get('/api/bookings', async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/bookings/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const bookings = await storage.getRecentBookings(limit);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      // Broadcast new booking
      broadcastToClients({
        type: 'new_booking',
        data: booking
      });
      
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/bookings/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(parseInt(req.params.id), status);
      
      // Broadcast booking status update
      broadcastToClients({
        type: 'booking_status_update',
        data: { bookingId: booking.id, status: booking.status }
      });
      
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payments routes
  app.get('/api/payments', async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/payments', async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Fuel records routes
  app.get('/api/fuel-records', async (req, res) => {
    try {
      const fuelRecords = await storage.getFuelRecords();
      res.json(fuelRecords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/fuel-records/vehicle/:vehicleId', async (req, res) => {
    try {
      const fuelRecords = await storage.getFuelRecordsByVehicle(parseInt(req.params.vehicleId));
      res.json(fuelRecords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/fuel-records', upload.single('receiptPhoto'), async (req, res) => {
    try {
      const fuelData = insertFuelRecordSchema.parse(req.body);
      
      if (req.file) {
        fuelData.receiptPhotoUrl = `/uploads/${req.file.filename}`;
      }

      const fuelRecord = await storage.createFuelRecord(fuelData);
      res.status(201).json(fuelRecord);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Maintenance records routes
  app.get('/api/maintenance-records', async (req, res) => {
    try {
      const maintenanceRecords = await storage.getMaintenanceRecords();
      res.json(maintenanceRecords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/maintenance-records/alerts', async (req, res) => {
    try {
      const alerts = await storage.getMaintenanceAlerts();
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/maintenance-records', upload.single('receiptPhoto'), async (req, res) => {
    try {
      const maintenanceData = insertMaintenanceRecordSchema.parse(req.body);
      
      if (req.file) {
        maintenanceData.receiptPhotoUrl = `/uploads/${req.file.filename}`;
      }

      const maintenanceRecord = await storage.createMaintenanceRecord(maintenanceData);
      res.status(201).json(maintenanceRecord);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // GPS tracking routes
  app.get('/api/gps-tracking', async (req, res) => {
    try {
      const gpsTracking = await storage.getLatestGpsTracking();
      res.json(gpsTracking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/gps-tracking/vehicle/:vehicleId', async (req, res) => {
    try {
      const gpsTracking = await storage.getGpsTrackingByVehicle(parseInt(req.params.vehicleId));
      res.json(gpsTracking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/gps-tracking', async (req, res) => {
    try {
      const gpsData = insertGpsTrackingSchema.parse(req.body);
      const gpsTracking = await storage.createGpsTracking(gpsData);
      
      // Broadcast GPS update
      broadcastToClients({
        type: 'gps_update',
        data: gpsTracking
      });
      
      res.status(201).json(gpsTracking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
