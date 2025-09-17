import React, { useState } from 'react';
import { MainNav } from "@/components/dashboard/Navbar";
// import { GridPulseLogo } from '@/components/logo';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/dashboard/Dashboard-Card';
// import { substationData } from '@/data/substationData';
import { 
  MapPin, 
  Search, 
  User, 
  Bell, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, parseISO } from 'date-fns';
import Footer from '@/components/comman/Footer';
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

const Substations = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Convert the object to an array for filtering and mapping
  const substations = Object.values(substationData);
  
  const filteredSubstations = substations.filter(substation => 
    substation.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    substation.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
  
  return (
    <div  className="w-full min-h-screen bg-[#272522] text-[#F5FBFE] flex">
      <MainNav />
      {/* Main content */}
      <div className="flex-1 pl-0 md:pl-72 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 grid-pulse-glass backdrop-blur-md border-b border-[#EBEBEB]/40 px-6 py-3">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                
              </div>
              <h1 className="text-xl font-semibold hidden md:block">Substations</h1>
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
        
        {/* Substation Content */}
        <main className="px-6 py-8 animate-fade-in">
          <DashboardCard
            title="Manage Substations"
            description="View and manage all substations in the system"
            className="col-span-full mb-8"
          >
            <div className="relative mb-6">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#94A3B8]" />
              <Input
                type="search"
                placeholder="Search substations by name or location..."
                className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                  focus-visible:outline-none focus-visible:ring-2 border-none
                                   focus-visible:ring-[#5EC9ED] pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubstations.length > 0 ? (
                filteredSubstations.map((substation) => (
                  <Card key={substation.id} className="overflow-hidden border border-[#272522] hover:border-[#5EC9ED]">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">{substation.name}</h3>
                          {/* {getStatusBadge(substation.status)} */}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#5FB1E8]" />
                            <span className="text-sm">{substation.location}</span>
                          </div>
                          
                          <div className="text-sm text-[#94A3B8]">
                            Last updated: {format(parseISO(substation.lastUpdated), 'PPP')}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">{substation.employees.length} employees assigned</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className=" border-border p-4 bg-[#343230]/20">
                        <Button
                          variant="outline"
                          className="bg-[#201E1D] w-full flex h-10 rounded-md  px-3 py-2
                          focus-visible:outline-none focus-visible:ring-2 border-none
                           focus-visible:ring-[#5EC9ED] pl-10 hover:bg-[#5EC9ED]" 
                          onClick={() => navigate(`/substation/${encodeURIComponent(substation.name)}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-[#343230]/30 rounded-full p-4 mb-4">
                    <AlertCircle className="h-8 w-8 text-[#94A3B8]" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No substations found</h3>
                  <p className="text-[#94A3B8]">Try adjusting your search query</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </main>
        
        {/* Footer */}
       <Footer/>
      </div>
    </div>
  );
};

export default Substations;