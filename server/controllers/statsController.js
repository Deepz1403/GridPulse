import { MongoClient } from 'mongodb';
import { formatResponse, formatError } from '../utils/responseFormatter.js';

export const getGridStats = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('Grids');

    const stats = await Promise.all([
      db.collection('substations').countDocuments(),
      db.collection('ss-5').countDocuments(),
      db.collection('ss-4').countDocuments(),
      db.collection('attendants').countDocuments()
    ]);

    // Get latest readings
    const latestSS5 = await db.collection('ss-5')
      .findOne({}, { sort: { Date: -1 } });
    
    const latestSS4 = await db.collection('ss-4')
      .findOne({}, { sort: { Date: -1 } });

    const statsData = {
      substations: stats[0],
      ss5_readings: stats[1],
      ss4_readings: stats[2],
      attendants: stats[3],
      total_records: stats.reduce((a, b) => a + b, 0),
      latest_readings: {
        ss5: latestSS5 ? {
          date: latestSS5.Date,
          temperature: latestSS5.temperature,
          totalUnitsConsumed: latestSS5.totalUnitsConsumed,
          submittedBy: latestSS5.submittedBy
        } : null,
        ss4: latestSS4 ? {
          date: latestSS4.Date,
          temperature: latestSS4.temperature,
          totalUnitsConsumed: latestSS4.totalUnitsConsumed,
          submittedBy: latestSS4.submittedBy
        } : null
      }
    };

    res.json(formatResponse(statsData));
  } catch (error) {
    console.error('Grid stats error:', error);
    res.status(500).json(formatError(error.message));
  } finally {
    await client.close();
  }
};

export const getSubstationPerformance = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    const { substation, days = 7 } = req.query;
    
    if (!substation || !['ss-4', 'ss-5'].includes(substation)) {
      return res.status(400).json(formatError('Valid substation (ss-4 or ss-5) is required'));
    }

    await client.connect();
    const db = client.db('Grids');

    const collection = substation;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const performanceData = await db.collection(collection)
      .find({
        Date: { $exists: true }
      })
      .sort({ Date: -1 })
      .limit(parseInt(days))
      .toArray();

    const formattedData = performanceData.map(reading => ({
      date: reading.Date,
      temperature: reading.temperature,
      totalUnitsConsumed: reading.totalUnitsConsumed,
      submittedBy: reading.submittedBy,
      transformers: reading.transformers?.map(t => ({
        id: t.id,
        voltage: t.voltage,
        current: t.current,
        consumption: t.Consumption || t.consumption,
        topAreas: Object.entries(t.areas || {})
          .sort(([,a], [,b]) => (b || 0) - (a || 0))
          .slice(0, 5)
          .map(([area, consumption]) => ({ area, consumption }))
      }))
    }));

    res.json(formatResponse({
      substation: collection.toUpperCase(),
      period: `${days} days`,
      readings: formattedData
    }));
  } catch (error) {
    console.error('Substation performance error:', error);
    res.status(500).json(formatError(error.message));
  } finally {
    await client.close();
  }
};

export const getConsumptionTrends = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    const { period = 'week' } = req.query;
    
    let daysBack = 7;
    if (period === 'month') daysBack = 30;
    if (period === 'quarter') daysBack = 90;

    await client.connect();
    const db = client.db('Grids');

    const ss5Trends = await db.collection('ss-5').aggregate([
      {
        $match: {
          Date: { $exists: true },
          totalUnitsConsumed: { $exists: true }
        }
      },
      {
        $group: {
          _id: "$Date",
          avgConsumption: { $avg: "$totalUnitsConsumed" },
          avgTemperature: { $avg: "$temperature" },
          maxConsumption: { $max: "$totalUnitsConsumed" },
          minConsumption: { $min: "$totalUnitsConsumed" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: daysBack }
    ]).toArray();

    const ss4Trends = await db.collection('ss-4').aggregate([
      {
        $match: {
          Date: { $exists: true },
          totalUnitsConsumed: { $exists: true }
        }
      },
      {
        $group: {
          _id: "$Date",
          avgConsumption: { $avg: "$totalUnitsConsumed" },
          avgTemperature: { $avg: "$temperature" },
          maxConsumption: { $max: "$totalUnitsConsumed" },
          minConsumption: { $min: "$totalUnitsConsumed" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: daysBack }
    ]).toArray();

    res.json(formatResponse({
      period: period,
      trends: {
        ss5: ss5Trends,
        ss4: ss4Trends
      },
      summary: {
        ss5_avg: ss5Trends.reduce((sum, day) => sum + (day.avgConsumption || 0), 0) / ss5Trends.length,
        ss4_avg: ss4Trends.reduce((sum, day) => sum + (day.avgConsumption || 0), 0) / ss4Trends.length
      }
    }));
  } catch (error) {
    console.error('Consumption trends error:', error);
    res.status(500).json(formatError(error.message));
  } finally {
    await client.close();
  }
};
