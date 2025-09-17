
import React, { useEffect, useState } from 'react';
import { 
    MapPin, 
    Thermometer, 
    Clock, 
    ArrowLeft, 
    User, 
    Bell, 
    Activity,
    Calendar,
    UserPlus
  } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
  import { DashboardCard } from '@/components/dashboard/Dashboard-Card';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { MainNav } from "@/components/dashboard/Navbar";
import { useNavigate, useParams } from 'react-router-dom';
import { energyData } from '@/data/energyData';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import Footer from '../components/comman/Footer';


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
  const latestEnergyData = energyData[energyData.length - 1];
  const handleAssignEmployee = () => {
    // Instead of using session storage, we'll use navigation state
    if (substation) {
      navigate('/assign-employee', { state: { substationId: substation.id } });
    }
  };
const SubstationDetails = () => {
    const { substationName } = useParams();
    console.log(substationName)
    const decodedSubstationName = substationName ? decodeURIComponent(substationName) : '';
    const substation = substationData[decodedSubstationName];
    console.log("printing subsation name ,",substation)
    const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const getStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-[#F2FCE2] text-green-700 hover:bg-[#E5F8CE]">Operational</Badge>;
      case 'maintenance':
        return <Badge className="bg-[#FEF7CD] text-amber-700 hover:bg-[#FEEEB1]">Maintenance</Badge>;
      case 'offline':
        return <Badge className="bg-[#ea384c]/10 text-[#ea384c] hover:bg-[#ea384c]/20">Offline</Badge>;
      default:
        return null;
    }
  };
  const handleAssignEmployee = () => {
    // Instead of using session storage, we'll use navigation state
    if (substation) {
      navigate('/assign-employee', { state: { substationId: substation.id } });
    }
  };
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
      
      if (!substation) {
        toast.error("Substation not found", {
          description: "The requested substation information could not be found."
        });
        navigate('/employees');
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [substation, navigate]);


  const assignedEmployees = substation 
  ? employeeData.filter(emp => substation.employees.includes(emp.id))
  : [];

if (loading) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center items-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-64 bg-secondary/50 rounded mb-4"></div>
        <div className="h-4 w-40 bg-secondary/30 rounded"></div>
      </div>
    </div>
  );
}

if (!substation) {
  return null; // Will redirect in useEffect
}


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
                {/* <GridPulseLogo size="small" /> */}
              </div>
              <h1 className="text-xl font-semibold hidden md:block">Substation Details</h1>
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
              
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Substation Content */}
        <main className="px-6 py-8 space-y-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => navigate('/substations')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Substations
            </Button>
            
            <Button
              onClick={handleAssignEmployee}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Assign Employee
            </Button>
          </div>

          <DashboardCard
            title={substation.name}
            description={`Substation ID: ${substation.id}`}
            className="col-span-full"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main details card */}
              <Card className="lg:col-span-2 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Substation Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#5FB1E8]" />
                      <div>
                        <p className="text-sm text-[#94A3B8]">Location</p>
                        <p className="font-medium">{substation.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-[#94A3B8]">Temperature</p>
                        <p className="font-medium">{substation.temperature}°C</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* <Separator /> */}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-[#94A3B8]">Last Updated</p>
                        <p className="font-medium">
                          {format(parseISO(substation.lastUpdated), 'PPP')} at {format(parseISO(substation.lastUpdated), 'p')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-[#94A3B8]">Status</p>
                        <div className="font-medium">
                          {getStatusBadge(substation.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* <Separator /> */}
                  
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-2">Coordinates</p>
                    <div className="p-4 bg-[#343230]/20 rounded-md">
                      <p className="font-mono text-sm">
                        Latitude: {substation.coordinates.latitude} | Longitude: {substation.coordinates.longitude}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Assigned employees card */}
              <Card className="border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Assigned Personnel</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedEmployees.length > 0 ? (
                    <ul className="space-y-3">
                      {assignedEmployees.map((employee) => (
                        <li 
                          key={employee.id} 
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-[#343230]/30 transition-colors"
                        >
                          <div className="bg-[#5FB1E8]/20 rounded-full p-2">
                            <User className="h-4 w-4 text-[5FB1E8]" />
                          </div>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                          <div className="ml-auto">
                            {getStatusBadge(employee.status)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="bg-[#343230]/30 rounded-full p-3 mb-2">
                        <User className="h-6 w-6 text-[#94A3B8]" />
                      </div>
                      <p className="text-[#94A3B8]">No employees assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Latest Energy Data"
            description="Most recent readings for this substation"
            className="col-span-full"
          >
            <div className="border rounded-md border-[#EBEBEB]/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#343230]/50 ">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>TR-1</TableHead>
                      <TableHead>TR-1 Voltage (V)</TableHead>
                      <TableHead>TR-1 Current (A)</TableHead>
                      <TableHead>TR-2</TableHead>
                      <TableHead>TR-2 Voltage (V)</TableHead>
                      <TableHead>TR-2 Current (A)</TableHead>
                      <TableHead>Total Unit Consumed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-[#343230]/30 ">
                      <TableCell>{latestEnergyData.date}</TableCell>
                      <TableCell>{latestEnergyData.tr1.toLocaleString()}</TableCell>
                      <TableCell>{latestEnergyData.tr1Voltage}</TableCell>
                      <TableCell>{latestEnergyData.tr1Current}</TableCell>
                      <TableCell>{latestEnergyData.tr2.toLocaleString()}</TableCell>
                      <TableCell>{latestEnergyData.tr2Voltage}</TableCell>
                      <TableCell>{latestEnergyData.tr2Current}</TableCell>
                      <TableCell>{latestEnergyData.totalUnitConsumed ? latestEnergyData.totalUnitConsumed.toLocaleString() : 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </DashboardCard>
        </main>
        
        {/* Footer */}
       <Footer/>
      </div>
    </div>
  )
}

export default SubstationDetails