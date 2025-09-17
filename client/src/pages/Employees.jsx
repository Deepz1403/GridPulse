import React, { useState } from 'react';
import { MainNav } from "@/components/dashboard/Navbar";
import { DashboardCard } from '@/components/dashboard/Dashboard-Card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Search, User, Bell, UserPlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { employeeData, Employee } from '@/data/employeeData';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Footer from '@/components/comman/Footer';
import AddEmployeeForm from '@/components/employee/AddEmployeeForm';
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

const Employees = () => {
    const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const itemsPerPage = 5;
  const filteredData = employeeData.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.substation && employee.substation.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const navigate = useNavigate();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSubstationClick = (substationName) => {
    if (substationName) {
      navigate(`/substation/${encodeURIComponent(substationName)}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-[#F2FCE2] text-green-700 hover:bg-[#E5F8CE]">Available</Badge>;
      case 'unavailable':
        return <Badge className="bg-[#ea384c]/10 text-[#ea384c] hover:bg-[#ea384c]/20">Unavailable</Badge>;
      case 'unassigned':
        return <Badge className="bg-[#FEF7CD] text-amber-700 hover:bg-[#FEEEB1]">Unassigned</Badge>;
      default:
        return null;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-[#2ECC71]';
      case 'unavailable':
        return 'bg-[#ea384c]';
      case 'unassigned':
        return 'bg-amber-500';
      default:
        return 'bg-gray-300';
    }
  };
  const getStatusTooltipText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Unavailable';
      case 'unassigned':
        return 'Unassigned';
      default:
        return '';
    }
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
              {/* <GridPulseLogo size="small" /> */}
            </div>
            <h1 className="text-xl font-semibold hidden md:block">Employees</h1>
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
      
      {/* Employees Content */}
      <main className="px-6 py-8 space-y-8 animate-fade-in">
        <DashboardCard
          title="Employee Management"
          description="Manage employees and their substation assignments"
          className="col-span-full bg-[#282624] border-none"
        >
          <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                   className="bg-[#201E1D] flex h-10 rounded-md  px-3 py-2
                                   focus-visible:outline-none focus-visible:ring-2 border-none
                                    focus-visible:ring-[#5EC9ED] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={() => setShowAddEmployeeDialog(true)}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add New Employee
              </Button>
            </div>
          <div className="rounded-md border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full text-sm border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Substation</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((employee) => (
                    <TableRow key={employee.id}>
                          <TableCell className="font-medium text-gridpulse-blue flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(employee.status)}`}></div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getStatusTooltipText(employee.status)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {employee.id}
                        </TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                          {employee.substation ? (
                            <button 
                              onClick={() => handleSubstationClick(employee?.substation)}
                              className="bg-gridpulse-darkblue/10 px-2 py-1 rounded text-sm hover:bg-gridpulse-darkblue/20 transition-colors cursor-pointer text-primary"
                            >
                              {employee.substation}
                            </button>
                          ) : (
                            <span className="text-muted-foreground italic">Not Assigned</span>
                          )}
                        </TableCell>
                      {/* <TableCell>{getStatusBadge(employee.status)}</TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </DashboardCard>
      </main>
      
      {/* Footer */}
     <Footer/>
    </div>
    <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
        <DialogContent className="max-w-2xl bg-[#343230] text-[#F5FBFE]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Create New Employee Account</DialogTitle>
              <Button
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAddEmployeeDialog(false)}
                className="absolute right-4 top-4"
              >
                {/* <X className="h-4 w-4" /> */}
              </Button>
            </div>
            <DialogDescription>
              Fill in the details below to create a new employee account
            </DialogDescription>
          </DialogHeader>
          <AddEmployeeForm onSuccess={() => setShowAddEmployeeDialog(false)} />
        </DialogContent>
      </Dialog>
  </div>
  )
}

export default Employees