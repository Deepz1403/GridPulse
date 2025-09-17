import { z } from "zod";

export const formSchema = z.object({
  // SNo: z.coerce.number(),
  Date: z.string().min(1, { message: "Date is required" }),
  Time: z.string().optional(),
  TR1: z.coerce.number().optional(),
  TR1Voltage: z.coerce.number().optional(),
  TR1Current: z.coerce.number().optional(),
  TR2: z.coerce.number().optional(),
  TR2Voltage: z.coerce.number().optional(),
  TR2Current: z.coerce.number().optional(),
  ChillerPlantRoom: z.coerce.number().optional(),
  Chiller1: z.coerce.number().optional(),
  PHouse: z.coerce.number().optional(),
  CSBuilding: z.coerce.number().optional(),
  LC: z.coerce.number().optional(),
  NRoadSide: z.coerce.number().optional(),
  RDSS: z.coerce.number().optional(),
  CommonPanel: z.coerce.number().optional(),
  LC2: z.coerce.number().optional(),
  Chiller2: z.coerce.number().optional(),
  Chiller3: z.coerce.number().optional(),
  FirePumpRoom: z.coerce.number().optional(),
  WSPumpRoom: z.coerce.number().optional(),
  NSide: z.coerce.number().optional(),
  DataCentre: z.coerce.number().optional(),
  Dispensary: z.coerce.number().optional(),
  EGAC: z.coerce.number().optional(),
  TotalUnitConsumed: z.coerce.number().positive({ message: "Total unit consumed is required" }),
  customFields: z.array(
    z.object({
      name: z.string().min(1, { message: "Field name is required" }),
      value: z.coerce.number(),
      unit: z.enum(['kwh', 'mwh', 'v', 'a', 'none']).default('none'),
    })
  ).optional(),
});

export const substationFormSchema = z.object({
  substationId: z.string().min(1, { message: "Substation ID is required" }),
  substation: z.string().min(1, { message: "Substation name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  temperature: z.number().nonnegative({ message: "Temperature must be a positive number" }),
  Date: z.date({
    required_error: "Date is required",
  }),
  Time: z.string().optional(),
});
