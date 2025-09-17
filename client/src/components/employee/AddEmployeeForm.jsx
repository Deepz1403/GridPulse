import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Lock, Mail, Phone } from "lucide-react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
export const substationData = {
  "North Station Alpha": {
    id: "SUB001",
    name: "North Station Alpha",
    location: "Northern District, Grid Sector 12",
    temperature: 24.5,
    status: "operational",
    lastUpdated: "2024-06-15T10:30:00Z",
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437,
    },
    employees: ["EMP001", "EMP008"],
  },
  "South Station Beta": {
    id: "SUB002",
    name: "South Station Beta",
    location: "Southern Industrial Zone, Sector 8",
    temperature: 26.2,
    status: "maintenance",
    lastUpdated: "2024-06-14T16:45:00Z",
    coordinates: {
      latitude: 33.9416,
      longitude: -118.4085,
    },
    employees: ["EMP002", "EMP009"],
  },
  "East Station Gamma": {
    id: "SUB003",
    name: "East Station Gamma",
    location: "Eastern Residential Area, Block 5",
    temperature: 22.8,
    status: "operational",
    lastUpdated: "2024-06-15T09:15:00Z",
    coordinates: {
      latitude: 34.1478,
      longitude: -118.1445,
    },
    employees: ["EMP004"],
  },
  "West Station Delta": {
    id: "SUB004",
    name: "West Station Delta",
    location: "Western Commercial District, Zone 3",
    temperature: 25.3,
    status: "offline",
    lastUpdated: "2024-06-14T14:20:00Z",
    coordinates: {
      latitude: 34.0211,
      longitude: -118.4814,
    },
    employees: ["EMP005"],
  },
  "Central Station Epsilon": {
    id: "SUB005",
    name: "Central Station Epsilon",
    location: "Downtown Core, Main Grid Hub",
    temperature: 23.7,
    status: "operational",
    lastUpdated: "2024-06-15T11:10:00Z",
    coordinates: {
      latitude: 34.0407,
      longitude: -118.2468,
    },
    employees: ["EMP007"],
  },
};

const employeeFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  substation: z.string().optional(),
});

const AddEmployeeForm = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      substation: undefined,
    },
  });

  const onSubmit = async (data) => {
    try {
      // In a real application, this would call an API to create the employee
      console.log("Creating employee:", data);

      // Generate a random ID for this demo
      const id = `EMP${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;

      // Add the new employee to the employeeData array (this is a mock implementation)
      const newEmployee = {
        id,
        name: data.name,
        email: data.email,
        status: "available",
        substation: data.substation || null,
      };

      // NOTE: In a real app, this would be handled by the backend
      // For demo purposes, we'll just show a success message
      toast.success("Employee created successfully", {
        description: `${data.name} has been added to the system`,
      });

      // Reset the form
      form.reset();

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Failed to create employee");
    }
  };

  // Get all substations for dropdown
  const substations = Object.values(substationData);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter name"
                      {...field}
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter email"
                      {...field}
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3  top-1/2  -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showPassword ? (
                        <IoIosEyeOff size={16} />
                      ) : (
                        <IoIosEye size={16} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter phone number"
                      {...field}
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="substation"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Assigned Substation (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a substation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#343230] text-[#F5FBFE]" >
                    {substations.map((substation) => (
                      <SelectItem key={substation.id} value={substation.name}>
                        {substation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto">
            Create Employee Account
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddEmployeeForm;
