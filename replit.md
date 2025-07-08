# Taxi Management System

## Overview

This is a comprehensive taxi management system built with React, Express, and PostgreSQL. The application provides a complete solution for managing taxi operations including driver management, vehicle tracking, booking systems, GPS real-time tracking, payments, maintenance scheduling, and fuel management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Real-time Communication**: WebSocket server for live updates
- **File Upload**: Multer for handling multipart/form-data
- **API Design**: RESTful endpoints with JSON responses

### Key Components

#### Database Schema
- **Users**: Authentication and role management (admin, client, driver)
- **Drivers**: Driver profiles, licenses, and status tracking
- **Vehicles**: Vehicle registration, insurance, and maintenance records
- **Clients**: Customer information and booking history
- **Bookings**: Ride requests and trip management
- **Payments**: Financial transactions and payment methods
- **GPS Tracking**: Real-time location data
- **Fuel Records**: Fuel consumption and cost tracking
- **Maintenance Records**: Vehicle service history and alerts
- **System Settings**: Application configuration

#### Core Features
- **Dashboard**: Real-time KPIs, recent bookings, driver status
- **Driver Management**: Registration, profile management, status tracking
- **Vehicle Management**: Fleet tracking, maintenance scheduling
- **Booking System**: Trip requests, assignment, and completion
- **GPS Tracking**: Real-time vehicle location monitoring
- **Payment Processing**: Multiple payment methods (cash, mobile money, cards)
- **Maintenance Management**: Service scheduling and alerts
- **Fuel Management**: Consumption tracking and cost analysis
- **Statistics**: Performance metrics and reporting

## Data Flow

1. **User Authentication**: Role-based access control for admins, drivers, and clients
2. **Real-time Updates**: WebSocket connections for live GPS tracking and booking updates
3. **Booking Lifecycle**: Request → Assignment → In Progress → Completion → Payment
4. **GPS Tracking**: Continuous location updates from vehicles to the central system
5. **Maintenance Alerts**: Automated notifications based on mileage and service schedules

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state
- **Date Handling**: date-fns for date operations
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket server for live updates
- **File Upload**: Multer for handling file uploads
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Development**: tsx for TypeScript execution

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon serverless PostgreSQL
- **Real-time**: WebSocket server on same port

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: esbuild bundle for Node.js
- **Database**: Drizzle migrations for schema management
- **Deployment**: Single server deployment with static file serving

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Connection pooling with Neon serverless
- **Development**: Push schema changes directly to database

## Changelog

- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.