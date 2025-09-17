import React, { useEffect, useState } from 'react';
import { MainNav } from "@/components/dashboard/Navbar";
// import { GridPulseLogo } from '@/components/logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Search,
  CheckCircle2,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/Dashboard-Card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// import { employeeData } from '@/data/employeeData';
// import { Substation } from '@/data/substationData';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Footer from '@/components/comman/Footer';

const employeeData = [
    {
      id: "EMP001",
      name: "John Doe",
      email: "john.doe@gridpulse.com",
      substation: "North Station Alpha",
      status: "available"
    },
    {
      id: "EMP002",
      name: "Jane Smith",
      email: "jane.smith@gridpulse.com",
      substation: "South Station Beta",
      status: "unavailable"
    },
    {
      id: "EMP003",
      name: "Robert Johnson",
      email: "robert.johnson@gridpulse.com",
      substation: "South Station Beta",
      status: "unassigned"
    },
    {
      id: "EMP004",
      name: "Emily Williams",
      email: "emily.williams@gridpulse.com",
      substation: "East Station Gamma",
      status: "available"
    },
    {
      id: "EMP005",
      name: "Michael Brown",
      email: "michael.brown@gridpulse.com",
      substation: "West Station Delta",
      status: "unavailable"
    },
    {
      id: "EMP006",
      name: "Sarah Davis",
      email: "sarah.davis@gridpulse.com",
      substation: null,
      status: "unassigned"
    },
    {
      id: "EMP007",
      name: "David Miller",
      email: "david.miller@gridpulse.com",
      substation: "Central Station Epsilon",
      status: "available"
    }
  ];
  export const substationData = {
    "North Station Alpha": {
      id: "SUB001",
      name: "North Station Alpha",
      location: "Northern District, Grid Sector 12",
      temperature: 24.5,
      status: 'operational',
      lastUpdated: "2024-06-15T10:30:00Z",
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437
      },
      employees: ["EMP001", "EMP008"]
    },
    "South Station Beta": {
      id: "SUB002",
      name: "South Station Beta",
      location: "Southern Industrial Zone, Sector 8",
      temperature: 26.2,
      status: 'maintenance',
      lastUpdated: "2024-06-14T16:45:00Z",
      coordinates: {
        latitude: 33.9416,
        longitude: -118.4085
      },
      employees: ["EMP002", "EMP009"]
    },
    "East Station Gamma": {
      id: "SUB003",
      name: "East Station Gamma",
      location: "Eastern Residential Area, Block 5",
      temperature: 22.8,
      status: 'operational',
      lastUpdated: "2024-06-15T09:15:00Z",
      coordinates: {
        latitude: 34.1478,
        longitude: -118.1445
      },
      employees: ["EMP004"]
    },
    "West Station Delta": {
      id: "SUB004",
      name: "West Station Delta",
      location: "Western Commercial District, Zone 3",
      temperature: 25.3,
      status: 'offline',
      lastUpdated: "2024-06-14T14:20:00Z",
      coordinates: {
        latitude: 34.0211,
        longitude: -118.4814
      },
      employees: ["EMP005"]
    },
    "Central Station Epsilon": {
      id: "SUB005",
      name: "Central Station Epsilon",
      location: "Downtown Core, Main Grid Hub",
      temperature: 23.7,
      status: 'operational',
      lastUpdated: "2024-06-15T11:10:00Z",
      coordinates: {
        latitude: 34.0407,
        longitude: -118.2468
      },
      employees: ["EMP007"]
    }
  };


const AssignEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [substation, setSubstation] = useState(null);
  const [availableSubstations, setAvailableSubstations] = useState([]);
  
  const form = useForm({
    defaultValues: {
      substationId: '',
    },
  });

  useEffect(() => {
    // Convert substationData object to array
    const substationArray = Object.values(substationData);
    setAvailableSubstations(substationArray);
    
    // Check if we have a substation from session storage or from location state
    const savedSubstation = sessionStorage.getItem('selectedSubstation');
    const locationSubstationId = location.state?.substationId;
    
    if (locationSubstationId) {
      // If we got a substation ID from the location state, find the substation
      const foundSubstation = substationArray.find(sub => sub.id === locationSubstationId);
      if (foundSubstation) {
        setSubstation(foundSubstation);
        form.setValue('substationId', foundSubstation.id);
        initializeEmployees(foundSubstation);
      }
    } else if (savedSubstation) {
      // Fall back to session storage if available
      const parsedSubstation = JSON.parse(savedSubstation);
      setSubstation(parsedSubstation);
      form.setValue('substationId', parsedSubstation.id);
      initializeEmployees(parsedSubstation);
    }
  }, [form, location.state]);
  
  const initializeEmployees = (selectedSubstation) => {
    // Initialize employees based on the selected substation
    const formattedEmployees = employeeData.map(emp => ({
      ...emp,
      isAssigned: selectedSubstation.employees.includes(emp.id),
      isSelected: false
    }));
    
    setEmployees(formattedEmployees);
  };
  
  const handleSubstationChange = (substationId) => {
    const selectedSubstation = availableSubstations.find(sub => sub.id === substationId);
    if (selectedSubstation) {
      setSubstation(selectedSubstation);
      initializeEmployees(selectedSubstation);
    }
  };
  
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleEmployeeSelection = (employeeId) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, isSelected: !emp.isSelected }
          : emp
      )
    );
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-[#F2FCE2] text-green-700 hover:bg-[#E5F8CE]">Available</Badge>;
      case 'unavailable':
        return <Badge className="bg-[#FEF7CD] text-amber-700 hover:bg-[#FEEEB1]">Unavailable</Badge>;
      case 'unassigned':
        return <Badge className="bg-[#E5DEFF] text-purple-700 hover:bg-[#D3CBFF]">Unassigned</Badge>;
      default:
        return null;
    }
  };
  
  const handleSaveAssignments = () => {
    if (!substation) {
      toast.error("No substation selected", {
        description: "Please select a substation first."
      });
      return;
    }
    
    // In a real application, we would make an API call here
    // For this demo, we'll just show a toast message
    const selectedEmployees = employees.filter(emp => emp.isSelected);
    
    toast.success("Employees assigned successfully", {
      description: `${selectedEmployees.length} employees have been assigned to ${substation.name}.`
    });
    
    // Navigate back to the substation details page
    navigate(`/substation/${encodeURIComponent(substation.name)}`);
  };
  
  return (
    <div className="w-full min-h-screen bg-[#272522] text-[#F5FBFE] flex">
      <MainNav />
      
      {/* Main content */}
      <div className="flex-1 pl-0 md:pl-72 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 grid-pulse-glass backdrop-blur-md border-b border-[#EBEBEB]/40 px-6 py-3">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                
              </div>
              <h1 className="text-xl font-semibold hidden md:block">Assign Employees</h1>
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
              
              <Button variant="ghost" size="icon" className="rounded-full bg-[#343230]/50">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="px-6 py-8 space-y-8 animate-fade-in">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => navigate('/substations')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {substation?.name || 'Substations'}
            </Button>
          </div>
          
          <DashboardCard
             title={`Assign Employees to ${substation?.name || 'Substation'}`}
            description="Select a substation and employees to assign"
            className="col-span-full"
          >
            {/* <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="substationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Substation</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSubstationChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a substation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Substations</SelectLabel>
                            {availableSubstations.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-gridpulse-blue" />
                                  <span>{sub.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </form>
            </Form> */}

            {substation ? (
              <>
                <div className="relative mt-6 mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#94A3B8]" />
                  <Input
                    type="search"
                    placeholder="Search employees by name or email..."
                    className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                    focus-visible:outline-none focus-visible:ring-2 border-none
                     focus-visible:ring-[#5EC9ED] pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <Card 
                        key={employee.id}
                        className={`transition-colors hover:bg-[#343230]/10 cursor-pointer  border border-[#343230] ${
                          employee.isSelected ? 'border-[#F5FBFE]/50 bg-[#F5FBFE]/5' : ''
                        }`}
                        onClick={() => toggleEmployeeSelection(employee.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-full p-2 ${
                                employee.isSelected ? 'bg-[#F5FBFE]/20' : 'bg-[#343230]/30'
                              }`}>
                                <User className={`h-5 w-5 ${
                                  employee.isSelected ? 'text-[#F5FBFE]' : 'text-[#94A3B8]'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-xs text-[#94A3B8]">{employee.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {employee.isAssigned && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  Already Assigned
                                </Badge>
                              )}
                              {getStatusBadge(employee.status)}
                              
                              {employee.isSelected && (
                                <CheckCircle2 className="h-5 w-5 text-[#F5FBFE]" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-[#343230]/30 rounded-full p-4 mb-4">
                        <User className="h-8 w-8 text-[#94A3B8]" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No employees found</h3>
                      <p className="text-[#94A3B8]">Try adjusting your search query</p>
                    </div>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/substations')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveAssignments}
                    disabled={!employees.some(emp => emp.isSelected) || !substation}
                  >
                    Save Assignments
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-[#343230]/30 rounded-full p-4 mb-4">
                  <Building className="h-8 w-8 text-[#94A3B8]" />
                </div>
                <h3 className="text-lg font-medium mb-1">No substation selected</h3>
                <p className="text-[#94A3B8]">Please select a substation from the dropdown above</p>
              </div>
            )}
          </DashboardCard>
        </main>
        
        {/* Footer */}
        <Footer/>
      </div>
    </div>
  );
};

export default AssignEmployee;