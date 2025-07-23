import { z } from 'zod';

// Trip log validation schema
export const tripLogSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  miles: z.number().min(0.1, 'Miles must be greater than 0').max(10000, 'Miles seems too high'),
  startLocation: z.string().min(1, 'Start location is required').max(200, 'Location too long'),
  endLocation: z.string().min(1, 'End location is required').max(200, 'Location too long'),
  purpose: z.string().min(1, 'Purpose is required').max(500, 'Purpose too long'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  vehicleId: z.string().uuid('Invalid vehicle ID').optional()
});

// Invoice validation schema
export const invoiceSchema = z.object({
  customerEmail: z.string().email('Invalid email address'),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Name too long'),
  amount: z.number().min(1, 'Amount must be greater than 0').max(1000000, 'Amount too high'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
});

// Vehicle validation schema
export const vehicleSchema = z.object({
  vehicleName: z.string().min(1, 'Vehicle name is required').max(100, 'Name too long'),
  make: z.string().max(50, 'Make too long').optional(),
  model: z.string().max(50, 'Model too long').optional(),
  year: z.number().int().min(1900, 'Year too old').max(new Date().getFullYear() + 1, 'Year too far in future').optional(),
  licensePlate: z.string().max(20, 'License plate too long').optional(),
  vin: z.string().max(17, 'VIN too long').optional(),
  fuelType: z.enum(['diesel', 'gasoline']).optional()
});

// Receipt validation schema
export const receiptSchema = z.object({
  receiptDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  vendor: z.string().max(100, 'Vendor name too long').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  totalAmount: z.number().min(0, 'Amount cannot be negative').max(10000, 'Amount too high').optional(),
  gallons: z.number().min(0, 'Gallons cannot be negative').max(1000, 'Gallons too high').optional(),
  pricePerGallon: z.number().min(0, 'Price cannot be negative').max(20, 'Price too high').optional(),
  stateCode: z.string().length(2, 'State code must be 2 characters').optional(),
  rawOcrText: z.string().max(5000, 'OCR text too long').optional()
});

// Sanitization function to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

// Sanitize OCR text specifically
export const sanitizeOcrText = (text: string): string => {
  // Remove potential script tags and normalize whitespace
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000); // Limit length
};

export type TripLogInput = z.infer<typeof tripLogSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type ReceiptInput = z.infer<typeof receiptSchema>;