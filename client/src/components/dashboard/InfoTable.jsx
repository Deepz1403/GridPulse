import { useState, useEffect, useContext, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DashboardCard } from '@/components/dashboard/Dashboard-Card';
import { SocketContext } from '@/context/socket';

// Date parsing helper function
const parseDate = (dateString, timeString) => {
  try {
    // Handle various date formats
    if (!dateString) return new Date(0); // Default to oldest date if missing
    
    // Try direct parsing first (for ISO format dates)
    const directParsed = new Date(dateString + (timeString ? ' ' + timeString : ''));
    if (!isNaN(directParsed.getTime())) {
      return directParsed;
    }
    
    // If direct parsing fails, try specific format parsing
    // Assuming date format is "DD Month YYYY" and time format is "HH:MM AM/PM"
    const [day, month, year] = dateString.split(' ');
    
    // Handle different month formats
    let monthIndex;
    const fullMonths = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    if (fullMonths.includes(month)) {
      monthIndex = fullMonths.indexOf(month);
    } else if (shortMonths.includes(month)) {
      monthIndex = shortMonths.indexOf(month);
    } else {
      // Try numeric month
      monthIndex = parseInt(month) - 1;
    }
    
    // Parse time if available
    let hours = 0, minutes = 0;
    if (timeString) {
      const [time, period] = timeString.split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      
      hours = parseInt(hoursStr);
      minutes = parseInt(minutesStr);
      
      if (period && period.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period && period.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }
    }
    
    return new Date(parseInt(year), monthIndex, parseInt(day), hours, minutes);
  } catch (error) {
    console.error('Error parsing date:', dateString, timeString, error);
    return new Date(0); // Default to oldest date on error
  }
};

export const InfoTable = ({ data }) => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [availableTransformers, setAvailableTransformers] = useState([]);
  const itemsPerPage = 6;
  
  // Get socket instance from context
  const socket = useContext(SocketContext);

  // Detect available transformers in the data
  useEffect(() => {
    if (data && data.length > 0) {
      const latestData = data[data.length - 1];
      if (latestData && latestData.transformers) {
        // Find all transformers in the data
        const transformers = latestData.transformers
          .map((transformer, index) => ({
            id: `tr${index + 1}`,
            index: index,
            name: `TR-${index + 1}`
          }))
          .filter((transformer, index) => {
            return latestData.transformers[index] !== undefined;
          });
        
        setAvailableTransformers(transformers);
      }
    }
  }, [data]);

  // Process initial data
  useEffect(() => {
    try {
      if (data && data.length > 0) {
        const formattedData = data.map((item, index) => {
          const rowData = {
            id: index + 1,
            date: item.Date || '',
            time: item.Time || '',
            totalUnitConsumed: item.totalUnitsConsumed || null
          };
          
          // Dynamically add transformer data
          if (item.transformers) {
            item.transformers.forEach((transformer, trIndex) => {
              if (transformer) {
                rowData[`tr${trIndex + 1}`] = transformer.Consumption || 0;
                rowData[`tr${trIndex + 1}Voltage`] = transformer.voltage || 0;
                rowData[`tr${trIndex + 1}Current`] = transformer.current || 0;
              }
            });
          }
          
          return rowData;
        });
        
        // Sort data with newest first
        const sortedData = formattedData
          .sort((a, b) => {
            const dateA = parseDate(a.date, a.time);
            const dateB = parseDate(b.date, b.time);
            return dateB - dateA; // Sort in descending order (newest first)
          })
          .map((item, index) => ({
            ...item,
            id: index + 1
          }));
        
        setTableData(sortedData);
      }
    } catch (error) {
      console.error('Error processing table data:', error);
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Socket.io listener for real-time updates
  useEffect(() => {
    // Create a function to handle data updates
    const handleDataUpdate = (newData) => {
      try {
        const updatedData = Array.isArray(newData) ? newData : [newData];
        
        const formattedNewData = updatedData.map((item) => {
          const rowData = {
            id: 0, // Temporary ID, will be updated when merging
            date: item.Date || '',
            time: item.Time || '',
            totalUnitConsumed: item.totalUnitsConsumed || null
          };
          
          // Dynamically add transformer data
          if (item.transformers) {
            item.transformers.forEach((transformer, trIndex) => {
              if (transformer) {
                rowData[`tr${trIndex + 1}`] = transformer.Consumption || 0;
                rowData[`tr${trIndex + 1}Voltage`] = transformer.voltage || 0;
                rowData[`tr${trIndex + 1}Current`] = transformer.current || 0;
              }
            });
          }
          
          return rowData;
        });
        
        setTableData(prevData => {
          const newData = [...prevData, ...formattedNewData];
          
          const sortedData = newData
            .sort((a, b) => {
              const dateA = parseDate(a.date, a.time);
              const dateB = parseDate(b.date, b.time);
              return dateB - dateA; // Sort in descending order (newest first)
            })
            .map((item, index) => ({
              ...item,
              id: index + 1
            }));
            
          return sortedData;
        });
        
        console.log('Real-time table data update received and sorted');
      } catch (error) {
        console.error('Error handling data update:', error);
      }
    };
    
    // Listen for data updates from the server
    socket.on('data_update', handleDataUpdate);

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Filter data based on search term
  const filteredData = tableData.filter(item => 
    (item.date || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate table columns dynamically based on available transformers
  const generateTableColumns = () => {
    const columns = [
      { key: 'id', title: 'S.No', width: 'w-[80px]' },
      { key: 'date', title: 'Date' },
      { key: 'time', title: 'Time' }
    ];
    
    // Add columns for each transformer
    availableTransformers.forEach(transformer => {
      columns.push({ key: transformer.id, title: transformer.name });
      columns.push({ key: `${transformer.id}Voltage`, title: `${transformer.name} Voltage (V)` });
      columns.push({ key: `${transformer.id}Current`, title: `${transformer.name} Current (A)` });
    });
    
    // Add total unit consumed column
    columns.push({ key: 'totalUnitConsumed', title: 'Total Unit Consumed' });
    
    return columns;
  };
  
  // Memoize table columns to prevent unnecessary recalculations
  const tableColumns = useMemo(() => generateTableColumns(), [availableTransformers]);

  return (
    <DashboardCard 
      title="Energy Data Logs" 
      description="Daily transformer and consumption readings"
      className="col-span-full"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#94A3B8]" />
          <Input
            placeholder="Search by date..."
            className="pl-8 bg-[#343230]/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md border-[#EBEBEB]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="">
            <TableHeader className="bg-[#363130]/90 text-white">
              <TableRow>
                {tableColumns.map(column => (
                  <TableHead 
                    key={column.key} 
                    className={column.width || ''}
                  >
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#5FB1E8]"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="text-center py-4">No data available</TableCell>
                </TableRow>
              ) : (
                currentItems.map((row) => (
                  <TableRow key={row.id} className="hover:bg-[#343230]/30">
                    {tableColumns.map(column => (
                      <TableCell key={`${row.id}-${column.key}`}>
                        {column.key === 'totalUnitConsumed' ? 
                          (row[column.key] ? row[column.key].toLocaleString() : 'N/A') :
                          typeof row[column.key] === 'number' ? 
                            row[column.key].toLocaleString() : 
                            row[column.key]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardCard>
  );
};
