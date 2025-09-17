import axios from 'axios';
import api from '@/config/api';

const API_URL = `${api}/attendant/SubstationData`;

export const fetchTransformerData = async () => {
  try {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const attendantId = user?.id || '';

    
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': attendantId
      },
      withCredentials: true // Optional if you're using sessions
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transformer data:', error);
    return [];
  }
};

export const processVoltageData = (data) => {
  return data.map(item => ({
    date: item.Date,
    tr1Voltage: item.transformers[0].voltage
  }));
};

export const processCurrentData = (data) => {
  return data.map(item => ({
    date: item.Date,
    tr1Current: item.transformers[0].current
  }));
};

export const processConsumptionData = (data) => {
  return data.map(item => ({
    date: item.Date,
    value: item.transformers[0].Consumption
  }));
};

export const processConsumptionByAreaData = (data) => {
  const latestData = data[data.length - 1];

  if (!latestData || !latestData.transformers[0].areas) {
    return [];
  }

  return Object.entries(latestData.transformers[0].areas)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value
    }));
};

export const processTR1SupplyData = (data) => {
  if (!data || data.length === 0) return [];
  
  // Filter data to entries with non-zero area values
  const validData = data.filter(item => {
    if (!item.transformers || !item.transformers[0] || !item.transformers[0].areas) return false;
    const areas = item.transformers[0].areas;
    return Object.values(areas).some(value => value > 0);
  });

  // Get all unique area names across all entries
  const allAreaNames = new Set();
  validData.forEach(item => {
    if (item.transformers && item.transformers[0] && item.transformers[0].areas) {
      Object.keys(item.transformers[0].areas).forEach(areaName => {
        if (item.transformers[0].areas[areaName] > 0) {
          allAreaNames.add(areaName);
        }
      });
    }
  });

  // Convert to array and sort for consistent ordering
  const areaNames = Array.from(allAreaNames).sort();

  // Process all valid data entries (not just the last 4)
  return validData.map(item => {
    const result = { date: item.Date };
    
    // Add all areas dynamically
    areaNames.forEach(areaName => {
      result[areaName] = item.transformers[0].areas[areaName] || 0;
    });
    
    return result;
  });
};

