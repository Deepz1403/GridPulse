// Power-Charts.jsx
import React, { useState, useEffect,useContext,useMemo } from 'react';
import { DashboardCard } from './Dashboard-Card';
import { 
  processVoltageData, 
  processCurrentData, 
  processConsumptionData, 
  processConsumptionByAreaData, 
  processTR1SupplyData 
} from '@/services/api';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { SocketContext } from '@/context/socket';
import {throttle} from 'lodash';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format,subDays,subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define colors
const colors = {
  primary: '#3B82F6',   // Blue
  secondary: '#EF4444', // Red
  tertiary: '#10B981',  // Green
  quaternary: '#F59E0B', // Amber
  accent1: '#8B5CF6',   // Purple
  accent2: '#EC4899'    // Pink
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#343230] p-3 border border-[#EBEBEB]/20 rounded shadow-md">
        <p className="text-[#F5FBFE] font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.stroke }}>
            {entry.name}: {entry.value} {entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const sortDataByDateAscending = (data) => {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.date || a.Date);
    const dateB = new Date(b.date || b.Date);
    return dateA - dateB; // Sort in ascending order (oldest first)
  });
};


import PropTypes from 'prop-types';

class ChartErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Chart rendering error</div>;
    }
    return this.props.children;
  }
}

ChartErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};


const DateRangePicker = ({ dateRange, onChange }) => {
DateRangePicker.propTypes = {
  dateRange: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    from: PropTypes.instanceOf(Date),
    to: PropTypes.instanceOf(Date),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
  return (
    <div className="flex items-center space-x-2">
      <Select 
        value={dateRange.mode} 
        onValueChange={(value) => {
          if (value === 'custom') {
            onChange({ ...dateRange, mode: value });
          } else {
            const now = new Date();
            let from, to;
            
            if (value === 'week') {
              from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              to = now;
            } else if (value === 'month') {
              from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              to = now;
            } else {
              from = undefined;
              to = undefined;
            }
            
            onChange({ from, to, mode: value });
          }
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">Last Week</SelectItem>
          <SelectItem value="month">Last Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>
      
      {dateRange.mode === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ 
                from: dateRange.from, 
                to: dateRange.to 
              }}
              onSelect={(range) => {
                onChange({ ...dateRange, ...range });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

// const filterDataByTimeRange = (data, timeRange) => {
//   if (!data || data.length === 0) return [];
  
//   const now = new Date();
//   let cutoffDate;
  
//   switch (timeRange) {
//     case 'week':
//       cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//       break;
//     case 'month':
//       cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//       break;
//     default:
//       return sortDataByDateAscending(data); // Ensure data is sorted even when not filtered
//   }
  
//   const filtered = data.filter(item => {
//     try {
//       const dateStr = item.date || item.Date;
//       const itemDate = new Date(dateStr);
//       return itemDate >= cutoffDate;
//     } catch (error) {
//       console.error('Error parsing date:', item.date || item.Date, error);
//       return false;
//     }
//   });
  
//   return sortDataByDateAscending(filtered);
// };

const filterDataByDateRange = (data, dateRange) => {
  if (!data || data.length === 0) return [];
  
  if (dateRange.mode === 'all') {
    return sortDataByDateAscending(data);
  }
  
  const now = new Date();
  let fromDate, toDate;
  
  if (dateRange.mode === 'custom' && dateRange.from) {
    fromDate = dateRange.from;
    toDate = dateRange.to || now;
  } else if (dateRange.mode === 'week') {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    toDate = now;
  } else if (dateRange.mode === 'month') {
    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    toDate = now;
  } else {
    return sortDataByDateAscending(data);
  }
  
  const filtered = data.filter(item => {
    try {
      const dateStr = item.date || item.Date;
      const itemDate = new Date(dateStr);
      return itemDate >= fromDate && itemDate <= toDate;
    } catch (error) {
      console.error('Error parsing date:', item.date || item.Date, error);
      return false;
    }
  });
  
  return sortDataByDateAscending(filtered);
};

const calculateYAxisDomain = (data, dataKey, padding = 0.1) => {
  if (!data || data.length === 0) return [0, 'auto'];
  
  const values = data.map(item => item[dataKey]);
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
  
  const threshold = 3 * stdDev;
  const filteredValues = values.filter(val => Math.abs(val - mean) <= threshold);
  
  const min = filteredValues.length > 0 ? Math.min(...filteredValues) : Math.min(...values);
  const max = filteredValues.length > 0 ? Math.max(...filteredValues) : Math.max(...values);
  

  const range = max - min;
  return [
    Math.max(0, min - range * padding), 
    max + range * padding
  ];
};

export const VoltageChart = ({ data }) => {
  const socket = useContext(SocketContext);
  const [chartData, setChartData] = useState(data || []);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
    mode: 'all'
  });
  const [availableTransformers, setAvailableTransformers] = useState([]);

  useEffect(() => {
    setChartData(data || []);
  }, [data]);

  useEffect(() => {
    const handleDataUpdate = throttle((newData) => {
      setChartData(prev => {
        const newItems = Array.isArray(newData) ? newData : [newData];
        return [...prev, ...newItems].slice(-200);
      });
    }, 500);

    socket.on('data_update', handleDataUpdate);
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Detect available transformers in the data
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const latestData = chartData[chartData.length - 1];
      if (latestData && latestData.transformers) {
        // Find all transformers that have voltage data
        const transformers = latestData.transformers
          .map((transformer, index) => ({
            id: `tr${index + 1}`,
            index: index,
            name: `TR-${index + 1}`
          }))
          .filter((transformer, index) => {
            return latestData.transformers[index] && 
                   typeof latestData.transformers[index].voltage !== 'undefined';
          });
        
        setAvailableTransformers(transformers);
      }
    }
  }, [chartData]);

  // Process data for all transformers
  const processedData = useMemo(() => {
    try {
      // If no transformers detected, return empty array
      if (availableTransformers.length === 0) return [];
      
      // Process data for all transformers
      return chartData.map(item => {
        const result = { date: item.Date };
        
        // Add voltage data for each available transformer
        availableTransformers.forEach(transformer => {
          if (item.transformers && 
              item.transformers[transformer.index] && 
              typeof item.transformers[transformer.index].voltage !== 'undefined') {
            result[`${transformer.id}Voltage`] = item.transformers[transformer.index].voltage;
          } else {
            result[`${transformer.id}Voltage`] = 0;
          }
        });
        
        return result;
      });
    } catch (error) {
      console.error('Error processing voltage data:', error);
      return [];
    }
  }, [chartData, availableTransformers]);
  
  const filteredData = useMemo(() => {
    const filtered = filterDataByDateRange(processedData, dateRange);
    return sortDataByDateAscending(filtered);
  }, [processedData, dateRange]);
  
  // Calculate Y-axis domain based on all transformer voltages
  const yAxisDomain = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || availableTransformers.length === 0) {
      return [0, 'auto'];
    }
    
    // Get all voltage values across all transformers
    const allVoltages = [];
    filteredData.forEach(item => {
      availableTransformers.forEach(transformer => {
        const voltageKey = `${transformer.id}Voltage`;
        if (typeof item[voltageKey] === 'number') {
          allVoltages.push(item[voltageKey]);
        }
      });
    });
    
    return calculateYAxisDomain(allVoltages, null, 0.1);
  }, [filteredData, availableTransformers]);

  // Get color for a transformer
  const getTransformerColor = (index) => {
    const colorPalette = [
      colors.primary,    // Blue for TR-1
      colors.secondary,  // Red for TR-2
      colors.tertiary,   // Green for TR-3
      colors.quaternary, // Amber for TR-4
      colors.accent1,    // Purple for TR-5
      colors.accent2     // Pink for TR-6
    ];
    
    return colorPalette[index % colorPalette.length];
  };

  return (
    <DashboardCard 
      title="Transformer Voltages" 
      description="Daily voltage readings for transformers"
      fullHeight
      rightContent={
        <DateRangePicker 
          dateRange={dateRange} 
          onChange={setDateRange} 
        />
      }
    >
      {!chartData.length ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FB1E8]"></div>
        </div>
      ) : filteredData.length === 0 || availableTransformers.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-400">No data available for the selected time range</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
            <defs>
              {/* Create gradient definitions for each transformer */}
              {availableTransformers.map((transformer, index) => (
                <linearGradient 
                  key={transformer.id} 
                  id={`color${transformer.id}`} 
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop 
                    offset="5%" 
                    stopColor={getTransformerColor(index)} 
                    stopOpacity={0.8}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={getTransformerColor(index)} 
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={yAxisDomain}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 15 }} />
            
            {/* Dynamically render lines for each transformer */}
            {availableTransformers.map((transformer, index) => (
              <Line 
                key={transformer.id}
                type="monotone" 
                dataKey={`${transformer.id}Voltage`} 
                name={`${transformer.name} Voltage (V)`}
                stroke={getTransformerColor(index)} 
                strokeWidth={2}
                dot={{ 
                  stroke: getTransformerColor(index), 
                  strokeWidth: 2, 
                  r: 4, 
                  fill: 'rgba(0,0,0,0.3)' 
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: getTransformerColor(index), 
                  strokeWidth: 2, 
                  fill: getTransformerColor(index) 
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
};


export const CurrentChart = ({ data }) => {
  const socket = useContext(SocketContext);
  const [chartData, setChartData] = useState(data || []);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
    mode: 'all'
  });
  const [availableTransformers, setAvailableTransformers] = useState([]);

  useEffect(() => {
    setChartData(data || []);
  }, [data]);

  useEffect(() => {
    const handleDataUpdate = throttle((newData) => {
      setChartData(prev => {
        const newItems = Array.isArray(newData) ? newData : [newData];
        return [...prev, ...newItems].slice(-150);
      });
    }, 500);

    socket.on('data_update', handleDataUpdate);
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Detect available transformers in the data
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const latestData = chartData[chartData.length - 1];
      if (latestData && latestData.transformers) {
        // Find all transformers that have current data
        const transformers = latestData.transformers
          .map((transformer, index) => ({
            id: `tr${index + 1}`,
            index: index,
            name: `TR-${index + 1}`
          }))
          .filter((transformer, index) => {
            return latestData.transformers[index] && 
                   typeof latestData.transformers[index].current !== 'undefined';
          });
        
        setAvailableTransformers(transformers);
      }
    }
  }, [chartData]);

  // Process data for all transformers
  const processedData = useMemo(() => {
    try {
      // If no transformers detected, return empty array
      if (availableTransformers.length === 0) return [];
      
      // Process data for all transformers
      return chartData.map(item => {
        const result = { date: item.Date };
        
        // Add current data for each available transformer
        availableTransformers.forEach(transformer => {
          if (item.transformers && 
              item.transformers[transformer.index] && 
              typeof item.transformers[transformer.index].current !== 'undefined') {
            result[`${transformer.id}Current`] = item.transformers[transformer.index].current;
          } else {
            result[`${transformer.id}Current`] = 0;
          }
        });
        
        return result;
      });
    } catch (error) {
      console.error('Error processing current data:', error);
      return [];
    }
  }, [chartData, availableTransformers]);
  
  const filteredData = useMemo(() => {
    return filterDataByDateRange(processedData, dateRange);
  }, [processedData, dateRange]);
  
  // Calculate Y-axis domain based on all transformer currents
  const yAxisDomain = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || availableTransformers.length === 0) {
      return [0, 'auto'];
    }
    
    // Get all current values across all transformers
    const allCurrents = [];
    filteredData.forEach(item => {
      availableTransformers.forEach(transformer => {
        const currentKey = `${transformer.id}Current`;
        if (typeof item[currentKey] === 'number') {
          allCurrents.push(item[currentKey]);
        }
      });
    });
    
    return calculateYAxisDomain(allCurrents, null, 0.1);
  }, [filteredData, availableTransformers]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  // Get color for a transformer
  const getTransformerColor = (index) => {
    const colorPalette = [
      '#3B82F6', // Blue for TR-1
      '#EF4444', // Red for TR-2
      '#10B981', // Green for TR-3
      '#F59E0B', // Amber for TR-4
      '#8B5CF6', // Purple for TR-5
      '#EC4899'  // Pink for TR-6
    ];
    
    return colorPalette[index % colorPalette.length];
  };

  const DateRangePicker = ({ dateRange, onChange }) => {
    const handleSelectChange = (value) => {
      const now = new Date();
      let from, to;

      switch (value) {
        case 'week':
          from = subDays(now, 7);
          to = now;
          break;
        case 'month':
          from = subMonths(now, 1);
          to = now;
          break;
        case 'all':
          from = undefined;
          to = undefined;
          break;
        default:
          // For 'custom', keep existing from/to if they exist
          from = dateRange.from;
          to = dateRange.to;
          break;
      }

      onChange({ from, to, mode: value });
    };

    return (
      <div className="flex items-center space-x-2">
        <Select value={dateRange.mode} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRange.mode === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onChange({ ...dateRange, ...range, mode: 'custom' });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  return (
    <ChartErrorBoundary>
      <DashboardCard
        title="Current Analysis"
        description="Daily current measurements in amperes"
        fullHeight
        rightContent={
          <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} />
        }
      >
        {!chartData.length ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FB1E8]"></div>
          </div>
        ) : filteredData.length === 0 || availableTransformers.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-400">No data available for the selected time range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <defs>
                {/* Create gradient definitions for each transformer */}
                {availableTransformers.map((transformer, index) => (
                  <linearGradient 
                    key={transformer.id} 
                    id={`color${transformer.id}Current`} 
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop 
                      offset="5%" 
                      stopColor={getTransformerColor(index)} 
                      stopOpacity={0.8}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={getTransformerColor(index)} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={yAxisDomain}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 15 }} />
              
              {/* Dynamically render areas for each transformer */}
              {availableTransformers.map((transformer, index) => (
                <Area 
                  key={transformer.id}
                  type="monotone" 
                  dataKey={`${transformer.id}Current`} 
                  name={`${transformer.name} Current (A)`}
                  stroke={getTransformerColor(index)} 
                  fill={`url(#color${transformer.id}Current)`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </DashboardCard>
    </ChartErrorBoundary>
  );
};

export const ConsumptionChart = ({ data }) => {
  const socket = useContext(SocketContext);
  const [chartData, setChartData] = useState(data || []);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
    mode: 'all'
  });
  const [availableTransformers, setAvailableTransformers] = useState([]);
  const [activeTransformers, setActiveTransformers] = useState({});

  useEffect(() => {
    setChartData(data || []);
  }, [data]);

  useEffect(() => {
    const handleDataUpdate = throttle((newData) => {
      setChartData(prev => {
        const newItems = Array.isArray(newData) ? newData : [newData];
        return [...prev, ...newItems].slice(-100);
      });
    }, 500);

    socket.on('data_update', handleDataUpdate);
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Detect available transformers in the data
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const latestData = chartData[chartData.length - 1];
      if (latestData && latestData.transformers) {
        // Find all transformers that have consumption data
        const transformers = latestData.transformers
          .map((transformer, index) => ({
            id: `tr${index + 1}`,
            index: index,
            name: `TR-${index + 1}`
          }))
          .filter((transformer, index) => {
            return latestData.transformers[index] && 
                   typeof latestData.transformers[index].Consumption !== 'undefined';
          });
        
        setAvailableTransformers(transformers);
        
        // Initialize active transformers state
        const newActiveTransformers = {};
        transformers.forEach(transformer => {
          newActiveTransformers[transformer.id] = 
            activeTransformers.hasOwnProperty(transformer.id) 
              ? activeTransformers[transformer.id] 
              : true;
        });
        setActiveTransformers(newActiveTransformers);
      }
    }
  }, [chartData]);

  // Process data for all transformers
  const processedData = useMemo(() => {
    try {
      // If no transformers detected, return empty array
      if (availableTransformers.length === 0) return [];
      
      // Process data for all transformers
      return chartData.map(item => {
        const result = { date: item.Date };
        
        // Add consumption data for each available transformer
        availableTransformers.forEach(transformer => {
          if (item.transformers && 
              item.transformers[transformer.index] && 
              typeof item.transformers[transformer.index].Consumption !== 'undefined') {
            result[`${transformer.id}Consumption`] = item.transformers[transformer.index].Consumption;
          } else {
            result[`${transformer.id}Consumption`] = 0;
          }
        });
        
        return result;
      });
    } catch (error) {
      console.error('Error processing consumption data:', error);
      return [];
    }
  }, [chartData, availableTransformers]);
  
  const filteredData = useMemo(() => {
    return filterDataByDateRange(processedData, dateRange);
  }, [processedData, dateRange]);
  
  // Calculate Y-axis domain based on all active transformer consumptions
  const yAxisDomain = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || availableTransformers.length === 0) {
      return [0, 'auto'];
    }
    
    // Get all consumption values across active transformers
    const allConsumptions = [];
    filteredData.forEach(item => {
      availableTransformers.forEach(transformer => {
        const consumptionKey = `${transformer.id}Consumption`;
        if (activeTransformers[transformer.id] && typeof item[consumptionKey] === 'number') {
          allConsumptions.push(item[consumptionKey]);
        }
      });
    });
    
    return calculateYAxisDomain(allConsumptions, null, 0.1);
  }, [filteredData, availableTransformers, activeTransformers]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  // Toggle transformer visibility
  const toggleTransformer = (transformerId) => {
    setActiveTransformers(prev => ({
      ...prev,
      [transformerId]: !prev[transformerId]
    }));
  };

  // Get color for a transformer
  const getTransformerColor = (index) => {
    const colorPalette = [
      colors.tertiary,   // Green for TR-1
      colors.secondary,  // Red for TR-2
      colors.primary,    // Blue for TR-3
      colors.quaternary, // Amber for TR-4
      colors.accent1,    // Purple for TR-5
      colors.accent2     // Pink for TR-6
    ];
    
    return colorPalette[index % colorPalette.length];
  };

  const DateRangePicker = ({ dateRange, onChange }) => {
    const handleSelectChange = (value) => {
      const now = new Date();
      let from, to;

      switch (value) {
        case 'week':
          from = subDays(now, 7);
          to = now;
          break;
        case 'month':
          from = subMonths(now, 1);
          to = now;
          break;
        case 'all':
          from = undefined;
          to = undefined;
          break;
        default:
          // For 'custom', keep existing from/to if they exist
          from = dateRange.from;
          to = dateRange.to;
          break;
      }

      onChange({ from, to, mode: value });
    };

    return (
      <div className="flex items-center space-x-2">
        <Select value={dateRange.mode} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRange.mode === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onChange({ ...dateRange, ...range, mode: 'custom' });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  // Transformer filter component
  const TransformerFilter = () => {
    if (availableTransformers.length <= 1) return null;
    
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {availableTransformers.map((transformer, index) => (
          <Button
            key={transformer.id}
            variant={activeTransformers[transformer.id] ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTransformer(transformer.id)}
            className="text-xs"
            style={{ 
              backgroundColor: activeTransformers[transformer.id] ? getTransformerColor(index) : 'transparent',
              borderColor: getTransformerColor(index)
            }}
          >
            {transformer.name}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <ChartErrorBoundary>
      <DashboardCard
        title="Daily Energy Consumption"
        description="Total units consumed per day"
        fullHeight
        rightContent={
          <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} />
        }
      >
        {!chartData.length ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FB1E8]"></div>
          </div>
        ) : filteredData.length === 0 || availableTransformers.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-400">No data available for the selected time range</p>
          </div>
        ) : (
          <>
            <TransformerFilter />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <defs>
                  {/* Create gradient definitions for each transformer */}
                  {availableTransformers.map((transformer, index) => (
                    <linearGradient 
                      key={transformer.id} 
                      id={`${transformer.id}ConsumptionGradient`} 
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop 
                        offset="5%" 
                        stopColor={getTransformerColor(index)} 
                        stopOpacity={0.8}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={getTransformerColor(index)} 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={yAxisDomain}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 15 }}
                  onClick={(e) => {
                    const transformerId = e.dataKey.replace('Consumption', '');
                    toggleTransformer(transformerId);
                  }}
                />
                
                {/* Dynamically render bars for each active transformer */}
                {availableTransformers
                  .filter(transformer => activeTransformers[transformer.id])
                  .map((transformer, index) => (
                    <Bar 
                      key={transformer.id}
                      dataKey={`${transformer.id}Consumption`} 
                      name={`${transformer.name} Consumption (kWh)`} 
                      fill={`url(#${transformer.id}ConsumptionGradient)`} 
                      radius={[4, 4, 0, 0]}
                      stackId={availableTransformers.length > 1 ? "stack" : undefined}
                    />
                  ))
                }
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </DashboardCard>
    </ChartErrorBoundary>
  );
};

export const ConsumptionByAreaChart = ({ data }) => {
  const socket = useContext(SocketContext);
  const [chartData, setChartData] = useState(data || []);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
    mode: 'all'
  });
  const [availableTransformers, setAvailableTransformers] = useState([]);
  const [activeTransformer, setActiveTransformer] = useState('tr1');

  useEffect(() => {
    setChartData(data || []);
  }, [data]);

  useEffect(() => {
    const handleDataUpdate = throttle((newData) => {
      setChartData(prev => {
        const newItems = Array.isArray(newData) ? newData : [newData];
        return [...prev, ...newItems].slice(-50);
      });
    }, 500);

    socket.on('data_update', handleDataUpdate);
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Detect available transformers in the data
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const latestData = chartData[chartData.length - 1];
      if (latestData && latestData.transformers) {
        // Find all transformers that have areas data
        const transformers = latestData.transformers
          .map((transformer, index) => ({
            id: `tr${index + 1}`,
            index: index,
            name: `TR-${index + 1}`
          }))
          .filter((transformer, index) => {
            return latestData.transformers[index] && 
                   latestData.transformers[index].areas &&
                   Object.keys(latestData.transformers[index].areas).length > 0;
          });
        
        setAvailableTransformers(transformers);
        
        // Set default active transformer if none is selected yet
        if (transformers.length > 0 && !transformers.find(t => t.id === activeTransformer)) {
          setActiveTransformer(transformers[0].id);
        }
      }
    }
  }, [chartData, activeTransformer]);

  const filteredData = useMemo(() => {
    return filterDataByDateRange(chartData, dateRange);
  }, [chartData, dateRange]);

  // Process data for the active transformer
  const processedData = useMemo(() => {
    try {
      if (!filteredData || filteredData.length === 0 || !activeTransformer) {
        return [];
      }
      
      // Find the index of the active transformer
      const activeTransformerIndex = parseInt(activeTransformer.replace('tr', '')) - 1;
      
      // Get the latest data point
      const latestData = filteredData[filteredData.length - 1];
      
      // Check if the transformer exists and has areas data
      if (!latestData || 
          !latestData.transformers || 
          !latestData.transformers[activeTransformerIndex] || 
          !latestData.transformers[activeTransformerIndex].areas) {
        return [];
      }
      
      // Process the areas data for the active transformer
      const areas = latestData.transformers[activeTransformerIndex].areas;
      
      return Object.entries(areas)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value
        }))
        .sort((a, b) => b.value - a.value); // Sort by value in descending order
    } catch (error) {
      console.error('Error processing area data:', error);
      return [];
    }
  }, [filteredData, activeTransformer]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const DateRangePicker = ({ dateRange, onChange }) => {
    const handleSelectChange = (value) => {
      const now = new Date();
      let from, to;

      switch (value) {
        case 'week':
          from = subDays(now, 7);
          to = now;
          break;
        case 'month':
          from = subMonths(now, 1);
          to = now;
          break;
        case 'all':
          from = undefined;
          to = undefined;
          break;
        default:
          // For 'custom', keep existing from/to if they exist
          from = dateRange.from;
          to = dateRange.to;
          break;
      }

      onChange({ from, to, mode: value });
    };

    return (
      <div className="flex items-center space-x-2">
        <Select value={dateRange.mode} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRange.mode === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onChange({ ...dateRange, ...range, mode: 'custom' });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  // Transformer selector component
  const TransformerSelector = () => {
    if (availableTransformers.length <= 1) return null;
    
    return (
      <div className="mb-4">
        <Select value={activeTransformer} onValueChange={setActiveTransformer}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select Transformer" />
          </SelectTrigger>
          <SelectContent>
            {availableTransformers.map(transformer => (
              <SelectItem key={transformer.id} value={transformer.id}>
                {transformer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const COLORS = [
    '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#14B8A6', '#F43F5E'
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    if (percent < 0.05) return null; // Don't show labels for segments less than 5%
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Enhanced tooltip for better value display
  const EnhancedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = processedData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-[#343230] p-3 border border-[#EBEBEB]/20 rounded shadow-md">
          <p className="text-[#F5FBFE] font-medium">{data.name}</p>
          <p className="text-[#F5FBFE]">
            {data.value.toLocaleString()} units ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartErrorBoundary>
      <DashboardCard
        title="Consumption by Area"
        description="Distribution of energy consumption across areas"
        fullHeight
        rightContent={
          <div className="flex items-center space-x-2">
            <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} />
            {availableTransformers.length > 1 && (
              <Select value={activeTransformer} onValueChange={setActiveTransformer}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Transformer" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransformers.map(transformer => (
                    <SelectItem key={transformer.id} value={transformer.id}>
                      {transformer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      >
        {!chartData.length ? (
          <div className="flex items-center justify-center h-[450px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FB1E8]"></div>
          </div>
        ) : processedData.length === 0 ? (
          <div className="flex items-center justify-center h-[450px]">
            <p className="text-gray-400">No data available for the selected time range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={renderCustomizedLabel}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<EnhancedTooltip />} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </DashboardCard>
    </ChartErrorBoundary>
  );
};

export const KWHChart = ({ data }) => {
  const socket = useContext(SocketContext);
  const [chartData, setChartData] = useState(data || []);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
    mode: 'all'
  });
  const [availableTransformers, setAvailableTransformers] = useState([]);
  const [activeTransformers, setActiveTransformers] = useState({});

  useEffect(() => {
    // Update chart data when component receives new props
    setChartData(data || []);
  }, [data]);

  useEffect(() => {
    const handleDataUpdate = throttle((newData) => {
      setChartData(prev => {
        const newItems = Array.isArray(newData) ? newData : [newData];
        return [...prev, ...newItems].slice(-100);
      });
    }, 500);

    socket.on('data_update', handleDataUpdate);
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Detect available transformers in the data
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const latestData = chartData[chartData.length - 1];
      if (latestData && latestData.transformers) {
        // Find all transformers that have consumption data
        const transformers = latestData.transformers
          .map((transformer, index) => ({
            id: `tr${index + 1}`,
            index: index,
            name: `TR-${index + 1}`
          }))
          .filter((transformer, index) => {
            return latestData.transformers[index] && 
                   typeof latestData.transformers[index].Consumption !== 'undefined';
          });
        
        setAvailableTransformers(transformers);
        
        // Initialize active transformers state
        const newActiveTransformers = {};
        transformers.forEach(transformer => {
          newActiveTransformers[transformer.id] = 
            activeTransformers.hasOwnProperty(transformer.id) 
              ? activeTransformers[transformer.id] 
              : true;
        });
        setActiveTransformers(newActiveTransformers);
      }
    }
  }, [chartData]);

  // Process data for all transformers
  const processedData = useMemo(() => {
    try {
      // If no transformers detected, return empty array
      if (availableTransformers.length === 0) return [];
      
      // Process data for all transformers
      return chartData.map(item => {
        const result = { date: item.Date };
        
        // Add consumption data for each available transformer
        availableTransformers.forEach(transformer => {
          if (item.transformers && 
              item.transformers[transformer.index] && 
              typeof item.transformers[transformer.index].Consumption !== 'undefined') {
            result[`${transformer.id}Value`] = item.transformers[transformer.index].Consumption;
          } else {
            result[`${transformer.id}Value`] = 0;
          }
        });
        
        return result;
      });
    } catch (error) {
      console.error('Error processing KWH data:', error);
      return [];
    }
  }, [chartData, availableTransformers]);
  
  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    return filterDataByDateRange(processedData, dateRange);
  }, [processedData, dateRange]);
  
  // Calculate appropriate Y-axis domain based on filtered data
  const yAxisDomain = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || availableTransformers.length === 0) {
      return [0, 'auto'];
    }
    
    // Get all consumption values across active transformers
    const allValues = [];
    filteredData.forEach(item => {
      availableTransformers.forEach(transformer => {
        const valueKey = `${transformer.id}Value`;
        if (activeTransformers[transformer.id] && typeof item[valueKey] === 'number') {
          allValues.push(item[valueKey]);
        }
      });
    });
    
    return calculateYAxisDomain(allValues, null, 0.1);
  }, [filteredData, availableTransformers, activeTransformers]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  // Toggle transformer visibility
  const toggleTransformer = (transformerId) => {
    setActiveTransformers(prev => ({
      ...prev,
      [transformerId]: !prev[transformerId]
    }));
  };

  // Get color for a transformer
  const getTransformerColor = (index) => {
    const colorPalette = [
      '#3B82F6', // Blue for TR-1
      '#EF4444', // Red for TR-2
      '#10B981', // Green for TR-3
      '#F59E0B', // Amber for TR-4
      '#8B5CF6', // Purple for TR-5
      '#EC4899'  // Pink for TR-6
    ];
    
    return colorPalette[index % colorPalette.length];
  };

  const DateRangePicker = ({ dateRange, onChange }) => {
    const handleSelectChange = (value) => {
      const now = new Date();
      let from, to;

      switch (value) {
        case 'week':
          from = subDays(now, 7);
          to = now;
          break;
        case 'month':
          from = subMonths(now, 1);
          to = now;
          break;
        case 'all':
          from = undefined;
          to = undefined;
          break;
        default:
          // For 'custom', keep existing from/to if they exist
          from = dateRange.from;
          to = dateRange.to;
          break;
      }

      onChange({ from, to, mode: value });
    };

    return (
      <div className="flex items-center space-x-2">
        <Select value={dateRange.mode} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRange.mode === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onChange({ ...dateRange, ...range, mode: 'custom' });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  // Transformer filter component
  const TransformerFilter = () => {
    if (availableTransformers.length <= 1) return null;
    
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {availableTransformers.map((transformer, index) => (
          <Button
            key={transformer.id}
            variant={activeTransformers[transformer.id] ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTransformer(transformer.id)}
            className="text-xs"
            style={{ 
              backgroundColor: activeTransformers[transformer.id] ? getTransformerColor(index) : 'transparent',
              borderColor: getTransformerColor(index)
            }}
          >
            {transformer.name}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <DashboardCard 
      title="Energy Consumption" 
      description="Historical energy consumption in kilowatt-hours"
      fullHeight
      rightContent={
        <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} />
      }
    >
      {!chartData.length ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FB1E8]"></div>
        </div>
      ) : filteredData.length === 0 || availableTransformers.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-400">No data available for the selected time range</p>
        </div>
      ) : (
        <>
          <TransformerFilter />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={yAxisDomain}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 15 }}
                onClick={(e) => {
                  const transformerId = e.dataKey.replace('Value', '');
                  toggleTransformer(transformerId);
                }}
              />
              
              {/* Dynamically render lines for each active transformer */}
              {availableTransformers
                .filter(transformer => activeTransformers[transformer.id])
                .map((transformer, index) => (
                  <Line 
                    key={transformer.id}
                    type="monotone" 
                    dataKey={`${transformer.id}Value`} 
                    name={`${transformer.name} KWH`} 
                    stroke={getTransformerColor(index)} 
                    strokeWidth={2}
                    dot={{ stroke: getTransformerColor(index), strokeWidth: 2, r: 4, fill: 'rgba(0,0,0,0.3)' }}
                    activeDot={{ r: 6, stroke: getTransformerColor(index), strokeWidth: 2, fill: getTransformerColor(index) }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </DashboardCard>
  );
};


export const TR1SupplyChart = ({ data }) => {
  const socket = useContext(SocketContext);
  const [chartData, setChartData] = useState(data || []);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
    mode: 'all'
  });
  const [scaleType, setScaleType] = useState('linear');
  const [activeLocations, setActiveLocations] = useState({});

  useEffect(() => {
    // Update chart data when component receives new props
    setChartData(data || []);
  }, [data]);

  useEffect(() => {
    const handleDataUpdate = throttle((newData) => {
      setChartData(prev => {
        const newItems = Array.isArray(newData) ? newData : [newData];
        return [...prev, ...newItems].slice(-50); // Keep last 50 entries for complex chart
      });
    }, 500);

    socket.on('data_update', handleDataUpdate);
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    
    if (dateRange.mode === 'all') {
      return chartData;
    }
    
    const now = new Date();
    let fromDate, toDate;
    
    if (dateRange.mode === 'custom' && dateRange.from) {
      fromDate = dateRange.from;
      toDate = dateRange.to || now;
    } else if (dateRange.mode === 'week') {
      fromDate = subDays(now, 7);
      toDate = now;
    } else if (dateRange.mode === 'month') {
      fromDate = subMonths(now, 1);
      toDate = now;
    } else {
      return chartData;
    }
    
    return chartData.filter(item => {
      try {
        const itemDate = new Date(item.Date);
        return itemDate >= fromDate && itemDate <= toDate;
      } catch (error) {
        console.error('Error parsing date:', item.Date, error);
        return false;
      }
    });
  }, [chartData, dateRange]);

  const processedData = useMemo(() => {
    try {
      return processTR1SupplyData(filteredData);
    } catch (error) {
      console.error('Error processing TR1 supply data:', error);
      return [];
    }
  }, [filteredData]);

  // Detect available locations from processed data
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      const locationSet = new Set();
      
      // Extract all location keys from the processed data
      processedData.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'date' && typeof item[key] === 'number') {
            locationSet.add(key);
          }
        });
      });
      
      // Create a new activeLocations object with all locations set to true
      const newActiveLocations = {};
      locationSet.forEach(location => {
        // Preserve existing state if available, otherwise default to true
        newActiveLocations[location] = 
          activeLocations.hasOwnProperty(location) 
            ? activeLocations[location] 
            : true;
      });
      
      // Update the activeLocations state
      setActiveLocations(newActiveLocations);
    }
  }, [processedData]);

  // Calculate appropriate Y-axis domain based on filtered data and active locations
  const yAxisDomain = useMemo(() => {
    if (!processedData || processedData.length === 0) return [0, 4000];
    
    // Get all values from all data series, but only for active locations
    const allValues = [];
    processedData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'date' && typeof item[key] === 'number' && activeLocations[key]) {
          allValues.push(item[key]);
        }
      });
    });
    
    if (allValues.length === 0) return [0, 4000];
    
    // For logarithmic scale, ensure minimum is at least 1
    if (scaleType === 'log') {
      const max = Math.max(...allValues);
      return [1, max * 1.1]; // 10% padding at the top
    }
    
    // Calculate statistics for outlier detection
    const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    const stdDev = Math.sqrt(allValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allValues.length);
    
    // Filter out extreme outliers (values that are more than 3 standard deviations from the mean)
    const threshold = 3 * stdDev;
    const filteredValues = allValues.filter(val => Math.abs(val - mean) <= threshold);
    
    // If we have filtered values, use them for domain calculation
    const max = filteredValues.length > 0 ? Math.max(...filteredValues) : Math.max(...allValues);
    
    // Add 10% padding to the top
    const padding = max * 0.1;
    return [0, max + padding];
  }, [processedData, activeLocations, scaleType]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  // Toggle location visibility
  const toggleLocation = (location) => {
    setActiveLocations(prev => ({
      ...prev,
      [location]: !prev[location]
    }));
  };

  // Get color for a location dynamically
  const getColorForLocation = (location, index) => {
    // Define a color palette
    const colorPalette = [
      "#3B82F6", // Blue
      "#EF4444", // Red
      "#ECC94B", // Yellow
      "#48BB78", // Green
      "#ED8936", // Orange
      "#38B2AC", // Teal
      "#90CDF4", // Light Blue
      "#FC8181", // Light Red
      "#F6E05E", // Light Yellow
      "#A78BFA", // Purple
      "#F472B6"  // Pink
    ];
    
    // Map specific locations to colors if needed
    const colorMap = {
      "Hostel-L AC": "#3B82F6",
      "Hostel-K AC Right Side": "#EF4444",
      "Hostel-K AC Centre Side": "#ECC94B",
      "Hostel-K AC Left Side": "#48BB78",
      "Hostel-K Normal Left": "#ED8936",
      "Hostel-K Normal Centre": "#38B2AC",
      "Hostel-K Normal Right": "#90CDF4",
      "Hostel-L Normal": "#FC8181",
      "Substation Supply": "#F6E05E",
      "W Supply Pump": "#A78BFA",
      "Type-3 New": "#F472B6"
    };
    
    // Return mapped color if exists, otherwise use color from palette based on index
    return colorMap[location] || colorPalette[index % colorPalette.length];
  };

  // Enhanced tooltip for better value display
  const EnhancedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Sort payload by value in descending order for better readability
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
      
      return (
        <div className="bg-[#343230] p-3 border border-[#EBEBEB]/20 rounded shadow-md max-h-[300px] overflow-y-auto">
          <p className="text-[#F5FBFE] font-medium mb-2">{label}</p>
          <div className="grid grid-cols-1 gap-1">
            {sortedPayload.map((entry, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: entry.color || entry.stroke }}
                  />
                  <span style={{ color: entry.color || entry.stroke }}>
                    {entry.name}:
                  </span>
                </div>
                <span className="ml-2 font-medium" style={{ color: entry.color || entry.stroke }}>
                  {entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const DateRangePicker = ({ dateRange, onChange }) => {
    const handleSelectChange = (value) => {
      const now = new Date();
      let from, to;

      switch (value) {
        case 'week':
          from = subDays(now, 7);
          to = now;
          break;
        case 'month':
          from = subMonths(now, 1);
          to = now;
          break;
        case 'all':
          from = undefined;
          to = undefined;
          break;
        default:
          // For 'custom', keep existing from/to if they exist
          from = dateRange.from;
          to = dateRange.to;
          break;
      }

      onChange({ from, to, mode: value });
    };

    return (
      <div className="flex items-center space-x-2">
        <Select value={dateRange.mode} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {dateRange.mode === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onChange({ ...dateRange, ...range, mode: 'custom' });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
        
        {/* Add scale type toggle */}
        <Select value={scaleType} onValueChange={setScaleType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Scale Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear Scale</SelectItem>
            <SelectItem value="log">Log Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Location filter component - now dynamically renders based on available locations
  const LocationFilter = () => (
    <div className="mb-4 flex flex-wrap gap-2">
      {Object.keys(activeLocations).map(location => (
        <Button
          key={location}
          variant={activeLocations[location] ? "default" : "outline"}
          size="sm"
          onClick={() => toggleLocation(location)}
          className="text-xs"
        >
          {location}
        </Button>
      ))}
    </div>
  );

  return (
    <DashboardCard 
      title="TR-1 Supply Chart" 
      description="Historical power consumption by area (MWH)"
      fullHeight
      rightContent={
        <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} />
      }
    >
      {!chartData.length ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FB1E8]"></div>
        </div>
      ) : processedData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-400">No data available for the selected time range</p>
        </div>
      ) : (
        <>
          <LocationFilter />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={processedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                scale={scaleType}
                domain={yAxisDomain}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<EnhancedTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 15 }}
                onClick={(e) => toggleLocation(e.dataKey)}
              />
              
              {/* Dynamically render lines for active locations */}
              {Object.keys(activeLocations)
                .filter(location => activeLocations[location])
                .map((location, index) => (
                  <Line 
                    key={location}
                    type="monotone" 
                    dataKey={location} 
                    name={location} 
                    stroke={getColorForLocation(location, index)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                ))
              }
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </DashboardCard>
  );
};





