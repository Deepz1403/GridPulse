import React, { useState, useEffect } from "react";
import { MainNav } from "@/components/dashboard/Navbar";
import {
  Bell,
  User,
  Save,
  MapPin,
  Thermometer,
  Calendar as ICalendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { substationFormSchema } from "../schemas/formSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import logo from "../assets/images/image.png";
// import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { DayPicker } from "react-day-picker";
import Calendar from "react-calendar";

const SubstationEntry = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const form = useForm({
    resolver: zodResolver(substationFormSchema),
  });

  const [date, setDate] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingTemperature, setFetchingTemperature] = useState(false);
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log("Form data submitted:", data);

      toast.success("Substation data submitted successfully", {
        description: `${data.substation} has been saved`,
      });

      form.reset({
        substationId: `SUB-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        substation: "",
        location: "",
        temperature: 0,
        Date: new Date(),
        Time: new Date().toTimeString().slice(0, 5),
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit substation data");
    } finally {
      setIsSubmitting(false);
    }
  };
  const watchLocation = form.watch("location");

  useEffect(() => {
    // Only fetch temperature if location is provided and has at least 3 characters
    if (watchLocation && watchLocation.length >= 3) {
      setFetchingTemperature(true);
      const timer = setTimeout(async () => {
        try {
          const temp = await fetchTemperatureForLocation(watchLocation);
          form.setValue("temperature", temp);
        } catch (error) {
          console.error("Error fetching temperature:", error);
          toast.error("Failed to fetch temperature");
        } finally {
          setFetchingTemperature(false);
        }
      }, 800); // Debounce the API call

      return () => clearTimeout(timer);
    }
  }, [watchLocation, form]);
  return (
    <div className="w-full min-h-screen bg-[#272522] text-[#F5FBFE] flex">
      <MainNav />

      {/* Main content */}
      <div className="flex-1 pl-0 md:pl-72 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 grid-pulse-glass backdrop-blur-md border-b border-border/40 px-6 py-3">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                
              </div>
              <h1 className="text-xl font-semibold hidden md:block">
                Substation Entry
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-red-500"></span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-secondary/50"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="px-6 py-8 pb-20 animate-fade-in">
          <Card className="grid-pulse-card max-w-2xl mx-auto border-none">
            <CardHeader className="">
              <CardTitle className="text-xl">Add New Substation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Substation Details Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="substationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Substation ID</FormLabel>
                            <FormControl>
                              <Input
                                readOnly
                                {...field}
                                className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                  focus-visible:outline-none focus-visible:ring-2 border-none
                                   focus-visible:ring-[#5EC9ED]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="substation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Substation Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter substation name"
                                {...field}
                                className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                  focus-visible:outline-none focus-visible:ring-2 border-none
                                   focus-visible:ring-[#5EC9ED]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Location and Temperature Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Enter location"
                                  {...field}
                                  className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                  focus-visible:outline-none focus-visible:ring-2 border-none
                                   focus-visible:ring-[#5EC9ED] pl-10"
                                />
                                <MapPin
                                  className="absolute left-3 top-1/2 transform 
                                -translate-y-1/2 h-4 w-4 text-[#F5FBFE]/70"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field: { onChange, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Temperature (°C)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  readOnly
                                  className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                  focus-visible:outline-none focus-visible:ring-2 border-none
                                   focus-visible:ring-[#5EC9ED] pl-10"
                                  {...rest}
                                  value={
                                    fetchingTemperature
                                      ? "Fetching..."
                                      : rest.value
                                  }
                                />
                                <Thermometer
                                  className="absolute left-3 top-1/2
                                 transform -translate-y-1/2 h-4 w-4 text-[#F5FBFE]/70"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Date and Time Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="Date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover className="border-none rounded-md">
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                //   className={cn(
                                //     "w-[240px] justify-start text-left font-normal",
                                //     !field.value && "text-muted-foreground"
                                //   )}
                                  className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                  focus-visible:outline-none focus-visible:ring-2 border-none
                                   focus-visible:ring-[#5EC9ED] w-[240px] justify-start text-left font-normal hover:bg-[#5EC9ED]"
                                >
                                  <ICalendar />
                                  {field.value  ? (
                                    format(field.value , "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                //   selected={field.value}
                                //   onSelect={field.onChange}
                             
                                
                                  initialFocus
                                  value={field.value}
                                  onChange={field.onChange}  
                                  className="rounded-md"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="Time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="time"
                                  {...field}
                                  className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                  focus-visible:outline-none focus-visible:ring-2 border-none
                                   focus-visible:ring-[#5EC9ED]"
                                   style={{
                                     colorScheme: "dark",
                                   }}
                                />
                                {/* <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/70" /> */}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="flex items-center gap-2"
                      disabled={isSubmitting || fetchingTemperature}
                    >
                      <Save size={18} />
                      {isSubmitting ? "Saving..." : "Save Substation"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 border-t border-border/40">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              
              <p className="text-sm text-muted-foreground mt-4 md:mt-0">
                © 2024 Grid Pulse. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SubstationEntry;
