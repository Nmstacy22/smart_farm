"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import FarmCard from "../../components/farm/FarmCard";
import LivestockCard from "../../components/farm/LivestockCard";
import AddEditFieldDialog from "../../components/farm/AddEditFieldDialog";
import AddEditLivestockDialog from "../../components/farm/AddEditLivestockDialog";
import { dbService } from "../../lib/services/db";
import {
  MapPin,
  Users,
  Search,
  Wheat,
  Droplet,
  Plus,
  Beef,
  HeartPulse,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FarmPage() {
  const [activeTab, setActiveTab] = useState<"fields" | "livestock">("fields");
  const [fields, setFields] = useState<any[]>([]);
  const [livestock, setLivestock] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<any | null>(null);

  const [livestockDialogOpen, setLivestockDialogOpen] = useState(false);
  const [selectedLivestock, setSelectedLivestock] = useState<any | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [fData, lData] = await Promise.all([
        dbService.getFields(),
        dbService.getLivestock(),
      ]);
      setFields(fData);
      setLivestock(lData);
    } catch (e) {
      console.error("Failed to load agricultural assets:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter crops and fields
  const filteredFields = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return fields;
    return fields.filter(
      (f) =>
        f.title.toLowerCase().includes(term) ||
        (f.crop || "").toLowerCase().includes(term),
    );
  }, [q, fields]);

  // Filter livestock herds
  const filteredLivestock = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return livestock;
    return livestock.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.type.toLowerCase().includes(term),
    );
  }, [q, livestock]);

  // Operational aggregates
  const fieldStats = useMemo(() => {
    const totalArea = fields.reduce(
      (sum, f) => sum + parseFloat(f.area || "0"),
      0,
    );
    const activeWorkers = fields.reduce((sum, f) => sum + (f.workers || 0), 0);
    const avgMoisture =
      fields.length > 0
        ? Math.round(
            fields.reduce((sum, f) => sum + (f.moisture || 0), 0) /
              fields.length,
          )
        : 0;

    return {
      count: fields.length,
      area: `${totalArea.toFixed(1)} ha`,
      workers: activeWorkers,
      moisture: `${avgMoisture}%`,
    };
  }, [fields]);

  const livestockStats = useMemo(() => {
    const totalAnimals = livestock.reduce((sum, l) => sum + (l.count || 0), 0);
    const healthyHerds = livestock.filter((l) => l.status === "healthy").length;
    const sickOrQuarantine = livestock.filter(
      (l) => l.status !== "healthy",
    ).length;

    return {
      total: totalAnimals,
      healthy: healthyHerds,
      attention: sickOrQuarantine,
    };
  }, [livestock]);

  // Field operations
  const handleSaveField = async (fieldData: any) => {
    if (fieldData.id) {
      await dbService.updateField(fieldData.id, fieldData);
    } else {
      await dbService.createField(fieldData);
    }
    loadData();
  };

  const handleDeleteField = async (id: string) => {
    if (confirm("Are you sure you want to delete this field?")) {
      await dbService.deleteField(id);
      loadData();
    }
  };

  // Livestock operations
  const handleSaveLivestock = async (livestockData: any) => {
    if (livestockData.id) {
      await dbService.updateLivestock(livestockData.id, livestockData);
    } else {
      await dbService.createLivestock(livestockData);
    }
    loadData();
  };

  const handleDeleteLivestock = async (id: string) => {
    if (confirm("Are you sure you want to delete this livestock batch?")) {
      await dbService.deleteLivestock(id);
      loadData();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl p-6 shadow-sm">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Farm Management
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
                Monitor fields, crop cycles, and livestock herds.
              </p>
            </div>

            {activeTab === "fields" ? (
              <button
                onClick={() => {
                  setSelectedField(null);
                  setFieldDialogOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedLivestock(null);
                  setLivestockDialogOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Livestock
              </button>
            )}
          </header>

          {/* Tab Toggle Navigation */}
          <div className="flex border-b border-slate-200/70 dark:border-zinc-800">
            <button
              onClick={() => {
                setActiveTab("fields");
                setQ("");
              }}
              className={`px-6 py-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 -mb-[2px] ${
                activeTab === "fields"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
              }`}
            >
              <Wheat className="w-4 h-4" />
              Crops & Fields
            </button>
            <button
              onClick={() => {
                setActiveTab("livestock");
                setQ("");
              }}
              className={`px-6 py-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 -mb-[2px] ${
                activeTab === "livestock"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
              }`}
            >
              <Beef className="w-4 h-4" />
              Livestock Herds
            </button>
          </div>

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <AnimatePresence mode="wait">
              {activeTab === "fields" ? (
                <>
                  {[
                    {
                      label: "Total Fields",
                      value: fieldStats.count,
                      icon: MapPin,
                      color: "text-emerald-600 dark:text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      label: "Total Area",
                      value: fieldStats.area,
                      icon: Wheat,
                      color: "text-amber-600 dark:text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                    {
                      label: "Workers Active",
                      value: fieldStats.workers,
                      icon: Users,
                      color: "text-sky-600 dark:text-sky-400",
                      bg: "bg-sky-500/10",
                    },
                    {
                      label: "Avg Moisture",
                      value: fieldStats.moisture,
                      icon: Droplet,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-500/10",
                    },
                  ].map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                          {label}
                        </span>
                        <div className={`p-2 rounded-lg ${bg} ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {value}
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    {
                      label: "Total Animals",
                      value: livestockStats.total.toLocaleString(),
                      icon: Beef,
                      color: "text-emerald-600 dark:text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      label: "Healthy Batches",
                      value: livestockStats.healthy,
                      icon: Activity,
                      color: "text-indigo-600 dark:text-indigo-400",
                      bg: "bg-indigo-500/10",
                    },
                    {
                      label: "Needs Attention",
                      value: livestockStats.attention,
                      icon: HeartPulse,
                      color: "text-rose-600 dark:text-rose-400",
                      bg: "bg-rose-500/10",
                    },
                    {
                      label: "Active Herds",
                      value: livestock.length,
                      icon: Users,
                      color: "text-amber-600 dark:text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                  ].map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                          {label}
                        </span>
                        <div className={`p-2 rounded-lg ${bg} ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {value}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Search filter input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                activeTab === "fields"
                  ? "Search fields or crops…"
                  : "Search herds or animal type…"
              }
              className="w-full pl-10 pr-4 py-3 border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-xl text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-950 dark:text-white"
            />
          </div>

          {/* Dynamic Items Grid */}
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "fields" ? (
                <motion.section
                  key="fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2"
                >
                  {filteredFields.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center text-slate-400">
                      <MapPin className="w-12 h-12 mb-4 opacity-30" />
                      <h3 className="text-lg font-bold text-slate-600 dark:text-zinc-400">
                        No fields matching your search
                      </h3>
                      <p className="text-sm mt-1 text-slate-500">
                        Log some fields to populate your farm.
                      </p>
                    </div>
                  ) : (
                    filteredFields.map((f) => (
                      <FarmCard
                        key={f.id}
                        field={f}
                        onEdit={() => {
                          setSelectedField(f);
                          setFieldDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteField(f.id)}
                      />
                    ))
                  )}
                </motion.section>
              ) : (
                <motion.section
                  key="livestock"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredLivestock.length === 0 ? (
                    <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center text-slate-400">
                      <Beef className="w-12 h-12 mb-4 opacity-30" />
                      <h3 className="text-lg font-bold text-slate-600 dark:text-zinc-400">
                        No livestock herds matching search
                      </h3>
                      <p className="text-sm mt-1 text-slate-500">
                        Register livestock groups to keep track of counts and
                        checks.
                      </p>
                    </div>
                  ) : (
                    filteredLivestock.map((l) => (
                      <LivestockCard
                        key={l.id}
                        livestock={l}
                        onEdit={() => {
                          setSelectedLivestock(l);
                          setLivestockDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteLivestock(l.id)}
                      />
                    ))
                  )}
                </motion.section>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Dialog Modals */}
      <AddEditFieldDialog
        open={fieldDialogOpen}
        onOpenChange={setFieldDialogOpen}
        field={selectedField}
        onSave={handleSaveField}
      />

      <AddEditLivestockDialog
        open={livestockDialogOpen}
        onOpenChange={setLivestockDialogOpen}
        livestock={selectedLivestock}
        onSave={handleSaveLivestock}
      />
    </DashboardLayout>
  );
}
