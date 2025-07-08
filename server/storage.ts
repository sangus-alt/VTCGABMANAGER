import { 
  users, drivers, vehicles, clients, bookings, payments, fuelRecords, 
  maintenanceRecords, gpsTracking, systemSettings, vehicleAssignments,
  type User, type InsertUser, type Driver, type InsertDriver,
  type Vehicle, type InsertVehicle, type Client, type InsertClient,
  type Booking, type InsertBooking, type Payment, type InsertPayment,
  type FuelRecord, type InsertFuelRecord, type MaintenanceRecord, type InsertMaintenanceRecord,
  type GpsTracking, type InsertGpsTracking, type SystemSetting, type InsertSystemSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count, sum, avg } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  
  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver | undefined>;
  getDriverByUserId(userId: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver>;
  updateDriverStatus(id: number, status: string): Promise<Driver>;
  
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  updateVehicleStatus(id: number, status: string): Promise<Vehicle>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByUserId(userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;
  
  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByClient(clientId: number): Promise<Booking[]>;
  getBookingsByDriver(driverId: number): Promise<Booking[]>;
  getRecentBookings(limit: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Payments
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment>;
  
  // Fuel Records
  getFuelRecords(): Promise<FuelRecord[]>;
  getFuelRecord(id: number): Promise<FuelRecord | undefined>;
  getFuelRecordsByVehicle(vehicleId: number): Promise<FuelRecord[]>;
  createFuelRecord(fuelRecord: InsertFuelRecord): Promise<FuelRecord>;
  updateFuelRecord(id: number, fuelRecord: Partial<InsertFuelRecord>): Promise<FuelRecord>;
  
  // Maintenance Records
  getMaintenanceRecords(): Promise<MaintenanceRecord[]>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordsByVehicle(vehicleId: number): Promise<MaintenanceRecord[]>;
  getMaintenanceAlerts(): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(maintenanceRecord: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, maintenanceRecord: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord>;
  
  // GPS Tracking
  getLatestGpsTracking(): Promise<GpsTracking[]>;
  getGpsTrackingByVehicle(vehicleId: number): Promise<GpsTracking[]>;
  createGpsTracking(gpsTracking: InsertGpsTracking): Promise<GpsTracking>;
  
  // System Settings
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;
  
  // Statistics
  getDashboardStats(): Promise<any>;
  getPaymentSummary(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.isActive, true));
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver || undefined;
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver> {
    const [updatedDriver] = await db.update(drivers).set(driver).where(eq(drivers.id, id)).returning();
    return updatedDriver;
  }

  async updateDriverStatus(id: number, status: string): Promise<Driver> {
    const [driver] = await db.update(drivers).set({ status }).where(eq(drivers.id, id)).returning();
    return driver;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.isActive, true));
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.licensePlate, licensePlate));
    return vehicle || undefined;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const [updatedVehicle] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updatedVehicle;
  }

  async updateVehicleStatus(id: number, status: string): Promise<Vehicle> {
    const [vehicle] = await db.update(vehicles).set({ status }).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.isActive, true));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByUserId(userId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return updatedClient;
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByClient(clientId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.clientId, clientId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByDriver(driverId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.driverId, driverId)).orderBy(desc(bookings.createdAt));
  }

  async getRecentBookings(limit: number): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db.update(bookings).set(booking).where(eq(bookings.id, id)).returning();
    return updatedBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [booking] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return booking;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updatedPayment] = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return updatedPayment;
  }

  // Fuel Records
  async getFuelRecords(): Promise<FuelRecord[]> {
    return await db.select().from(fuelRecords).orderBy(desc(fuelRecords.createdAt));
  }

  async getFuelRecord(id: number): Promise<FuelRecord | undefined> {
    const [fuelRecord] = await db.select().from(fuelRecords).where(eq(fuelRecords.id, id));
    return fuelRecord || undefined;
  }

  async getFuelRecordsByVehicle(vehicleId: number): Promise<FuelRecord[]> {
    return await db.select().from(fuelRecords).where(eq(fuelRecords.vehicleId, vehicleId)).orderBy(desc(fuelRecords.createdAt));
  }

  async createFuelRecord(insertFuelRecord: InsertFuelRecord): Promise<FuelRecord> {
    const [fuelRecord] = await db.insert(fuelRecords).values(insertFuelRecord).returning();
    return fuelRecord;
  }

  async updateFuelRecord(id: number, fuelRecord: Partial<InsertFuelRecord>): Promise<FuelRecord> {
    const [updatedFuelRecord] = await db.update(fuelRecords).set(fuelRecord).where(eq(fuelRecords.id, id)).returning();
    return updatedFuelRecord;
  }

  // Maintenance Records
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords).orderBy(desc(maintenanceRecords.createdAt));
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [maintenanceRecord] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return maintenanceRecord || undefined;
  }

  async getMaintenanceRecordsByVehicle(vehicleId: number): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.vehicleId, vehicleId)).orderBy(desc(maintenanceRecords.createdAt));
  }

  async getMaintenanceAlerts(): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords).where(
      and(
        eq(maintenanceRecords.status, "scheduled"),
        sql`${maintenanceRecords.nextServiceDate} <= NOW() + INTERVAL '30 days'`
      )
    );
  }

  async createMaintenanceRecord(insertMaintenanceRecord: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [maintenanceRecord] = await db.insert(maintenanceRecords).values(insertMaintenanceRecord).returning();
    return maintenanceRecord;
  }

  async updateMaintenanceRecord(id: number, maintenanceRecord: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord> {
    const [updatedMaintenanceRecord] = await db.update(maintenanceRecords).set(maintenanceRecord).where(eq(maintenanceRecords.id, id)).returning();
    return updatedMaintenanceRecord;
  }

  // GPS Tracking
  async getLatestGpsTracking(): Promise<GpsTracking[]> {
    return await db.select().from(gpsTracking).orderBy(desc(gpsTracking.timestamp)).limit(100);
  }

  async getGpsTrackingByVehicle(vehicleId: number): Promise<GpsTracking[]> {
    return await db.select().from(gpsTracking).where(eq(gpsTracking.vehicleId, vehicleId)).orderBy(desc(gpsTracking.timestamp)).limit(50);
  }

  async createGpsTracking(insertGpsTracking: InsertGpsTracking): Promise<GpsTracking> {
    const [gpsTrackingRecord] = await db.insert(gpsTracking).values(insertGpsTracking).returning();
    return gpsTrackingRecord;
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async createSystemSetting(insertSetting: InsertSystemSetting): Promise<SystemSetting> {
    const [setting] = await db.insert(systemSettings).values(insertSetting).returning();
    return setting;
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const [setting] = await db.update(systemSettings).set({ value }).where(eq(systemSettings.key, key)).returning();
    return setting;
  }

  // Statistics
  async getDashboardStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayCourses] = await db.select({ count: count() }).from(bookings).where(sql`DATE(${bookings.createdAt}) = DATE(${today})`);
    const [totalRevenue] = await db.select({ sum: sum(bookings.totalFare) }).from(bookings).where(eq(bookings.paymentStatus, "paid"));
    const [activeDrivers] = await db.select({ count: count() }).from(drivers).where(eq(drivers.status, "available"));
    const [totalDrivers] = await db.select({ count: count() }).from(drivers).where(eq(drivers.isActive, true));
    const [availableVehicles] = await db.select({ count: count() }).from(vehicles).where(eq(vehicles.status, "available"));
    const [totalVehicles] = await db.select({ count: count() }).from(vehicles).where(eq(vehicles.isActive, true));

    return {
      todayCourses: todayCourses.count || 0,
      totalRevenue: totalRevenue.sum || 0,
      activeDrivers: activeDrivers.count || 0,
      totalDrivers: totalDrivers.count || 0,
      availableVehicles: availableVehicles.count || 0,
      totalVehicles: totalVehicles.count || 0,
    };
  }

  async getPaymentSummary(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [cashTotal] = await db.select({ sum: sum(payments.amount) }).from(payments).where(
      and(
        eq(payments.paymentMethod, "cash"),
        eq(payments.status, "completed"),
        sql`DATE(${payments.createdAt}) = DATE(${today})`
      )
    );

    const [mobileTotal] = await db.select({ sum: sum(payments.amount) }).from(payments).where(
      and(
        eq(payments.paymentMethod, "mobile_money"),
        eq(payments.status, "completed"),
        sql`DATE(${payments.createdAt}) = DATE(${today})`
      )
    );

    const [cardTotal] = await db.select({ sum: sum(payments.amount) }).from(payments).where(
      and(
        eq(payments.paymentMethod, "card"),
        eq(payments.status, "completed"),
        sql`DATE(${payments.createdAt}) = DATE(${today})`
      )
    );

    const cash = Number(cashTotal.sum) || 0;
    const mobile = Number(mobileTotal.sum) || 0;
    const card = Number(cardTotal.sum) || 0;
    const total = cash + mobile + card;

    return {
      cash,
      mobile,
      card,
      total,
    };
  }
}

export const storage = new DatabaseStorage();
