import React, { useEffect, useState } from "react";
import axios from "axios";
import { MainNav } from "@/components/dashboard/Navbar"; // Adjust path as needed
import { FiCalendar, FiClock, FiThermometer, FiUser, FiZap, FiTrendingUp, FiCpu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/api";

const API_URL = `${api}/attendant/SubstationData`;

// Helper for MongoDB $numberDoublet or similar
function parseAreaValue(val) {
  if (val && typeof val === "object" && "$numberDoublet" in val) {
    return val.$numberDoublet;
  }
  return val ?? "";
}

export default function DataEntry() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL, { withCredentials: true })
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
        if (!Array.isArray(data) || !data.length) {
          setError("No substation data available.");
          setLoading(false);
          return;
        }
        const latest = data[data.length - 1];
        setForm({
          Date: "",
          Time: "",
          temperature: "",
          submittedBy: "",
          transformers: latest.transformers.map(tr => ({
            id: tr.id,
            voltage: "",
            current: "",
            Consumption: "",
            areas: Object.fromEntries(
              Object.keys(tr.areas).map(areaKey => [areaKey, ""])
            ),
          })),
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch substation data.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e, trIdx, areaKey = null) => {
    const { name, value } = e.target;
    setForm(prev => {
      if (trIdx !== undefined && areaKey === null) {
        const transformers = [...prev.transformers];
        transformers[trIdx][name] = value;
        return { ...prev, transformers };
      } else if (trIdx !== undefined && areaKey) {
        const transformers = [...prev.transformers];
        transformers[trIdx].areas = {
          ...transformers[trIdx].areas,
          [areaKey]: value,
        };
        return { ...prev, transformers };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    // Simulate API call
    setTimeout(() => {
      setSuccess("Form submitted successfully!");
    }, 700);
    // In real use, replace above with API call and error handling
    // axios.post(API_URL, form).then(...).catch(...)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181a1b] via-[#232526] to-[#1c1e22] flex w-full">
      <MainNav />
      <div className="flex-1 pl-0 md:pl-72 transition-all duration-300">
        <div className="w-full min-h-screen flex flex-col py-8 px-2 md:px-8">
          <div className="max-w-4xl w-full mx-auto flex-1">
            <motion.h2
              className="text-3xl font-extrabold mb-8 text-white flex items-center gap-2"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FiCpu className="text-blue-400" /> Enter Data for Substation
            </motion.h2>
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Loading...
                </motion.div>
              )}
              {error && (
                <motion.div
                  className="text-red-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  className="bg-green-700 text-white px-4 py-3 rounded mb-4 shadow"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>
            {form && (
              <form
                onSubmit={handleSubmit}
                className="space-y-10"
                autoComplete="off"
              >
                <motion.div
                  className="bg-[#222428] rounded-2xl shadow-lg p-8 mb-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-lg font-bold mb-6 text-teal-300 flex items-center gap-2">
                    <FiUser className="text-teal-400" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block mb-1 font-semibold text-gray-200 flex items-center gap-1">
                        <FiCalendar /> Date
                      </label>
                      <input
                        type="date"
                        name="Date"
                        value={form.Date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#292b2f] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-gray-200 flex items-center gap-1">
                        <FiClock /> Time
                      </label>
                      <input
                        type="time"
                        name="Time"
                        value={form.Time}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#292b2f] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-gray-200 flex items-center gap-1">
                        <FiThermometer /> Temperature (°C)
                      </label>
                      <input
                        type="number"
                        name="temperature"
                        value={form.temperature}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#292b2f] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                        placeholder="Temperature"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold text-gray-200 flex items-center gap-1">
                        <FiUser /> Submitted By
                      </label>
                      <input
                        type="email"
                        name="submittedBy"
                        value={form.submittedBy}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-[#292b2f] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                        placeholder="Email"
                      />
                    </div>
                  </div>
                </motion.div>
                
                <div className="space-y-8">
                  {form.transformers.map((tr, trIdx) => (
                    <motion.div
                      key={tr.id}
                      className="p-7 rounded-2xl bg-gradient-to-br from-[#202124] via-[#232526] to-[#1c1e22] border border-gray-800 shadow-xl"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * trIdx }}
                    >
                      <h3 className="text-lg font-bold mb-6 text-blue-300 flex items-center gap-2">
                        <FiZap className="text-yellow-400" /> {tr.id}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <label className="block mb-1 text-gray-200 font-semibold flex items-center gap-1">
                            <FiTrendingUp /> Voltage (V)
                          </label>
                          <input
                            type="number"
                            name="voltage"
                            value={tr.voltage}
                            onChange={e => handleChange(e, trIdx)}
                            className="w-full px-3 py-2 rounded-lg bg-[#222428] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                            placeholder="Voltage"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-gray-200 font-semibold flex items-center gap-1">
                            <FiTrendingUp /> Current (A)
                          </label>
                          <input
                            type="number"
                            name="current"
                            value={tr.current}
                            onChange={e => handleChange(e, trIdx)}
                            className="w-full px-3 py-2 rounded-lg bg-[#222428] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                            placeholder="Current"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-gray-200 font-semibold flex items-center gap-1">
                            <FiTrendingUp /> Consumption
                          </label>
                          <input
                            type="number"
                            name="Consumption"
                            value={tr.Consumption}
                            onChange={e => handleChange(e, trIdx)}
                            className="w-full px-3 py-2 rounded-lg bg-[#222428] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                            placeholder="Consumption"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(tr.areas).map(([areaKey, areaValue]) => (
                          <div key={areaKey}>
                            <label className="block mb-1 text-gray-200 font-semibold">
                              {areaKey}
                            </label>
                            <input
                              type="number"
                              value={areaValue}
                              onChange={e => handleChange(e, trIdx, areaKey)}
                              className="w-full px-3 py-2 rounded-lg bg-[#222428] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                              required
                              placeholder={areaKey}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    className="mt-6 px-10 py-3 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 font-bold text-white text-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                    whileTap={{ scale: 0.97 }}
                  >
                    Submit
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
