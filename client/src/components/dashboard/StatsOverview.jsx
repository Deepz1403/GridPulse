import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Zap, Thermometer, CircleDollarSign } from 'lucide-react';
import { MetricCard } from './Dashboard-Card';
import { SocketContext } from '@/context/socket';

export const StatsOverview = ({ data }) => {
  // State for storing the latest metrics
  const [transformerData, setTransformerData] = useState([]);
  const [avgConsumption, setAvgConsumption] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Get socket instance from context
  const socket = useContext(SocketContext);

  // Process data to extract metrics
  const processData = (data) => {
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Get latest and previous data points
      const latestData = data[data.length - 1];
      const previousData = data.length > 1 ? data[data.length - 2] : null;

      // Detect available transformers
      const transformers = latestData.transformers || [];
      const availableTransformers = [];
      
      // Process each transformer in the data
      transformers.forEach((transformer, index) => {
        if (transformer && typeof transformer.voltage !== 'undefined') {
          const transformerNumber = index + 1;
          
          // Store transformer data
          availableTransformers.push({
            id: `tr${transformerNumber}`,
            number: transformerNumber,
            voltage: transformer.voltage || 0,
            nominal: 420, // Assuming nominal value is the same for all transformers
            consumption: transformer.Consumption || 0,
            previousConsumption: previousData && previousData.transformers[index] ? 
              previousData.transformers[index].Consumption || 0 : 0
          });
        }
      });

      // Update state with available transformer data
      setTransformerData(availableTransformers);
      
      // Calculate average daily consumption (using last 7 days if available)
      if (availableTransformers.length > 0) {
        const recentData = data.slice(-7);
        const totalConsumption = recentData.reduce((sum, item) => {
          if (item.transformers && item.transformers[0]) {
            return sum + (item.transformers[0].Consumption || 0);
          }
          return sum;
        }, 0);
        const avgDaily = recentData.length > 0 ? totalConsumption / recentData.length : 0;
        setAvgConsumption(avgDaily);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error processing stats data:', error);
      setLoading(false);
    }
  };

  // Initial data processing
  useEffect(() => {
    processData(data);
  }, [data]);

  // Socket.io listener for real-time updates
  useEffect(() => {
    // Handle real-time data updates
    const handleDataUpdate = (newData) => {
      // If newData is a single object, convert it to an array
      const updatedData = Array.isArray(newData) ? newData : [newData];
      
      // Process the updated data
      processData(updatedData);
      
      console.log('Real-time stats update received');
    };

    // Listen for data updates from the server
    socket.on('data_update', handleDataUpdate);

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off('data_update', handleDataUpdate);
    };
  }, [socket]);

  // Render transformer voltage cards
  const renderTransformerCards = () => {
    return transformerData.map(transformer => {
      // Calculate voltage percentage from nominal
      const voltagePercentage = transformer.nominal > 0 
        ? ((transformer.voltage - transformer.nominal) / transformer.nominal) * 100 
        : 0;
      
      // Return voltage card for this transformer
      return (
        <MetricCard
          key={`${transformer.id}-voltage`}
          title={`Current TR-${transformer.number} Voltage`}
          value={transformer.voltage}
          unit="V"
          change={voltagePercentage.toFixed(1)}
          changeLabel="from nominal"
          icon={<Zap className="h-4 w-4" />}
          loading={loading}
        />
      );
    });
  };

  // Render consumption cards (based on first transformer if available)
  const renderConsumptionCards = () => {
    if (transformerData.length === 0) return null;
    
    const primaryTransformer = transformerData[0]; // Use first transformer for consumption data
    
    // Calculate consumption change percentage
    const consumptionChange = primaryTransformer.previousConsumption > 0 
      ? ((primaryTransformer.consumption - primaryTransformer.previousConsumption) / primaryTransformer.previousConsumption) * 100 
      : 0;
    
    return (
      <>
        <MetricCard
          key="latest-consumption"
          title="Latest Consumption"
          value={primaryTransformer.consumption}
          unit="kWh"
          change={consumptionChange.toFixed(1)}
          changeLabel="vs previous"
          trend={consumptionChange < 0 ? "down" : "up"}
          icon={<CircleDollarSign className="h-4 w-4" />}
          loading={loading}
        />
        
        <MetricCard
          key="avg-consumption"
          title="Avg Daily Consumption"
          value={avgConsumption}
          unit="kWh"
          icon={<Thermometer className="h-4 w-4" />}
          loading={loading}
        />
      </>
    );
  };

  // Determine the grid columns based on number of cards
  const getGridClass = () => {
    const totalCards = transformerData.length + (transformerData.length > 0 ? 2 : 0);
    
    if (totalCards <= 1) return "grid-cols-1";
    if (totalCards === 2) return "grid-cols-1 md:grid-cols-2";
    if (totalCards === 3) return "grid-cols-1 md:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <div className={`grid ${getGridClass()} gap-4`}>
      {renderTransformerCards()}
      {renderConsumptionCards()}
    </div>
  );
};

StatsOverview.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      transformers: PropTypes.arrayOf(
        PropTypes.shape({
          voltage: PropTypes.number,
          Consumption: PropTypes.number,
        })
      ),
    })
  ),
};
