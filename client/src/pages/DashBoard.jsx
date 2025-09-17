import { useEffect, useState,useContext } from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VoltageChart, CurrentChart, ConsumptionChart, ConsumptionByAreaChart, TR1SupplyChart, /*TR2SupplyChart*/ KWHChart } from '@/components/dashboard/Power-Charts';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/images/image.png";
import { MainNav } from "@/components/dashboard/Navbar";
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { InfoTable } from '@/components/dashboard/InfoTable';
import { SocketContext } from '@/context/socket';
import api from '@/config/api';

const DashBoard = () => {
  const [loading, setLoading] = useState(true);
  const [substationData, setSubstationData] = useState([]);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/attendant/SubstationData`, {
          withCredentials: true
        });

        const data = response.data?.data || [];

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        setSubstationData(data);
        toast.success('Data loaded successfully', {
          description: `Loaded ${data.length} records`,
          duration: 3000,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired', {
            description: 'Please login again',
            duration: 5000,
          });
          navigate('/login');
        } else {
          toast.error('Failed to load data', {
            description: error.response?.data?.message || error.message || 'Please check your connection and try again',
            duration: 5000,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on('data_update', (newData) => {
      setSubstationData(prevData => {
        const updatedData = [...prevData, newData];
        return updatedData.slice(-200);
      });
      toast.info('New data received', {
        description: 'Dashboard updated with latest information',
        duration: 3000,
      });
    });

    return () => {
      socket.off('data_update');
    };
  }, [navigate, socket]);
 
  return (
    <div className="min-h-screen bg-[#211F1E] text-[#F5FBFE] flex">
      <MainNav />
      <div className="flex-1 pl-0 md:pl-72 transition-all duration-300">
        <header className="fixed w-full top-0 z-30 grid-pulse-glass backdrop-blur-md border-b border-[#EBEBEB]/40 px-6 py-3">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4 w-full">
              <div className="md:hidden">
                <img src={logo} className="w-28 aspect-auto" loading="lazy" />
              </div>
              <h1 className="text-xl font-semibold hidden md:block text-white">Dashboard Overview</h1>
            </div>
            <div className="flex items-center gap-2 z-40">
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
              <Button variant="ghost" size="icon" className="rounded-full bg-[#343230]">
                <User className="h-5 w-5 z-50" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 space-y-8 animate-fade-in mt-16">
          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5FB1E8]"></div>
            </div>
          ) : (
            <>
              <StatsOverview data={substationData} />
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-8">
                <VoltageChart data={substationData} />
                <CurrentChart data={substationData} />
              </div>
              <div className="grid gap-6 grid-cols-1 mt-8">
                <KWHChart data={substationData} />
              </div>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-8">
                <ConsumptionChart data={substationData} />
                <ConsumptionByAreaChart data={substationData} />
              </div>
              <div className="grid gap-6 grid-cols-1 mt-8">
                <TR1SupplyChart data={substationData} />
              </div>
              <div className="grid gap-6 grid-cols-1 mt-8">
                <InfoTable data={substationData} />
              </div>
            </>
          )}
        </main>

        <footer className="py-6 px-6 border-t border-[#EBEBEB]/40">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <img src={logo} className="w-28 aspect-square" loading="lazy" />
              <p className="text-sm text-[#94A3B8] mt-4 md:mt-0">
                © 2024 Grid Pulse. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashBoard;
