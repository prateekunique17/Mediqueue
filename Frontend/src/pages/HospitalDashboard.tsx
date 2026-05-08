import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Clock, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Filter,
  Plus,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Menu,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const HospitalDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'staff'>('requests');
  const [queue, setQueue] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [showDocModal, setShowDocModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  
  const [docForm, setDocForm] = useState({ name: '', specialty: 'General Physician' });
  const [assignForm, setAssignForm] = useState({ doctorId: '', appointmentDate: '' });
  const [newSlot, setNewSlot] = useState({ start: '08:00', end: '12:00' });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const qRes = await fetch('/api/hospital/queue');
      const qData = await qRes.json();
      if (Array.isArray(qData)) setQueue(qData);

      const dRes = await fetch('/api/hospital/doctors');
      const dData = await dRes.json();
      if (Array.isArray(dData)) setDoctors(dData);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleAssign = async (patientId: string, doctorId: string, appointmentDate: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    try {
      const response = await fetch('/api/hospital/assign-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patient_id: patientId, 
          doctor_id: doctorId,
          doctor_name: doctor.name,
          appointment_date: appointmentDate
        }),
      });

      if (response.ok) {
        toast.success(`Assigned to ${doctor.name}`);
        setQueue(prevQueue => prevQueue.map(p => {
          if (p.id === patientId) {
            return {
              ...p,
              status: 'ASSIGNED',
              triage: { ...p.triage, assignedDoctor: doctor.name, appointmentDate }
            };
          }
          return p;
        }));
        setSelectedPatient(null);
        setAssignForm({ doctorId: '', appointmentDate: '' });
      }
    } catch (error) { toast.error("Assignment failed"); }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hospital/doctors/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      if (res.ok) {
        toast.success("Doctor added");
        setShowDocModal(false);
        fetchData();
        setDocForm({ name: '', specialty: 'General Physician' });
      }
    } catch (error) { toast.error("Failed to add doctor"); }
  };

  const handleDeleteDoctor = async (docId: string) => {
    try {
      const res = await fetch(`/api/hospital/doctors/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.info("Doctor removed");
        fetchData();
      }
    } catch (error) { toast.error("Delete failed"); }
  };

  const handleManageAvailability = (doc: any) => {
    setSelectedDoctor(doc);
    setAvailabilitySlots(doc.availability || []);
    setShowAvailabilityModal(true);
  };

  const addTimeSlot = () => {
    setAvailabilitySlots([...availabilitySlots, newSlot]);
  };

  const removeTimeSlot = (index: number) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    if (!selectedDoctor) return;
    try {
      const res = await fetch(`/api/hospital/doctors/${selectedDoctor.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: availabilitySlots }),
      });
      if (res.ok) {
        toast.success("Availability updated");
        setShowAvailabilityModal(false);
        fetchData();
      }
    } catch (error) { toast.error("Failed to save availability"); }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return 'bg-error-container text-on-error-container';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-secondary-container text-on-secondary-container';
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body flex antialiased overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-fade"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`bg-surface-container-low w-64 border-r border-outline-variant flex flex-col h-screen fixed lg:sticky top-0 z-[70] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-headline font-extrabold text-primary text-xl leading-none">MEDIQUEUE</h1>
                <p className="text-[10px] text-outline font-black uppercase tracking-widest mt-1">Provider Node</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-outline hover:text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'requests', label: 'Triage Queue', icon: Clock },
              { id: 'history', label: 'Patient History', icon: Calendar },
              { id: 'staff', label: 'Specialists', icon: Users }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === item.id ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 flex flex-col gap-4">
          <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/50">
            <p className="text-[10px] text-outline font-black uppercase tracking-widest mb-1">Current Facility</p>
            <p className="font-bold text-sm text-on-surface truncate">City General Hospital</p>
          </div>
          <button onClick={signOut} className="flex items-center gap-3 px-4 py-2 text-outline hover:text-error transition-colors font-semibold">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col min-h-screen w-full">
        <header className="h-16 border-b border-outline-variant px-4 lg:px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-outline hover:text-primary transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-on-surface truncate">
              {activeTab === 'requests' ? 'Triage Queue' : activeTab === 'staff' ? 'Staff' : 'Analytics'}
            </h2>
            <button onClick={fetchData} className="p-1.5 hover:bg-surface-container rounded-lg text-outline transition-colors hidden sm:block">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full text-sm focus:outline-none w-32 lg:w-48 transition-all focus:w-64"
              />
            </div>
            <button className="p-2 text-outline hover:text-primary transition-colors relative">
              <Bell className="w-5 h-5" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white"></div>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8 overflow-y-auto">
          {activeTab === 'requests' && (
            <div className="animate-fade">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {[
                  { label: 'Active Triage', value: queue.filter(p => p.status === 'PENDING').length, icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'Emergency', value: queue.filter(p => p.triage?.urgency === 'EMERGENCY').length, icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
                  { label: 'Total Handled', value: queue.filter(p => p.status === 'ASSIGNED').length, icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
                  { label: 'Staff Online', value: doctors.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-outline-variant rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-outline uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                      <p className="text-xl font-headline font-extrabold text-on-surface">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-6 order-2 xl:order-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-outline uppercase tracking-widest">Incoming Requests ({queue.filter(p => p.status === 'PENDING').length})</p>
                    <button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                      <Filter className="w-3 h-3" /> Filter
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {queue.filter(p => p.status === 'PENDING').length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-surface-container-low rounded-[2rem] border border-dashed border-outline-variant">
                        <Clock className="w-12 h-12 text-outline mx-auto mb-4 opacity-50" />
                        <p className="text-outline font-bold uppercase tracking-widest text-xs">No pending triage requests</p>
                      </div>
                    ) : queue.filter(p => p.status === 'PENDING').map(req => (
                      <div 
                        key={req.id} 
                        onClick={() => { setSelectedPatient(req); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`ambient-shadow-card p-5 lg:p-6 border-2 transition-all cursor-pointer group ${
                          selectedPatient?.id === req.id ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary border border-outline-variant shrink-0">
                              {req.id.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-on-surface truncate">Patient #{req.id.slice(0, 5)}</h4>
                              <p className="text-[10px] text-outline font-black uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${getUrgencyStyles(req.triage?.urgency)}`}>
                            {req.triage?.urgency || 'ROUTINE'}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium leading-relaxed italic mb-4 line-clamp-2">"{req.primaryProblem}"</p>
                        <div className="bg-surface-container-low p-3 rounded-xl flex items-center gap-3">
                          <Stethoscope className="w-4 h-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] text-outline font-black uppercase tracking-widest">AI Suggestion</p>
                            <p className="text-xs font-bold text-on-surface truncate">{req.triage?.doctorType || 'General Physician'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-4 order-1 xl:order-2">
                  <div className="xl:sticky xl:top-24 bg-white rounded-[2rem] border border-outline-variant shadow-ambient-elevated overflow-hidden flex flex-col">
                    {selectedPatient ? (
                      <div className="animate-fade flex flex-col">
                        <div className="p-6 border-b border-outline-variant bg-surface-container-low">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline text-xl font-bold">Assign Specialist</h3>
                            <button onClick={() => setSelectedPatient(null)} className="p-1 hover:bg-white rounded-full transition-colors"><X className="w-5 h-5 text-outline" /></button>
                          </div>
                          <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black text-outline uppercase tracking-widest">Select Doctor</label>
                              <select 
                                value={assignForm.doctorId}
                                onChange={(e) => setAssignForm({...assignForm, doctorId: e.target.value})}
                                className="w-full p-3 bg-white border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:border-primary transition-all appearance-none"
                              >
                                <option value="">Select available physician...</option>
                                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black text-outline uppercase tracking-widest">Select Date</label>
                              <input 
                                type="date" 
                                value={assignForm.appointmentDate.split('T')[0]}
                                onChange={(e) => setAssignForm({...assignForm, appointmentDate: e.target.value + 'T' + (assignForm.appointmentDate.split('T')[1] || '08:00')})}
                                className="w-full p-3 bg-white border border-outline-variant rounded-xl text-sm font-semibold outline-none focus:border-primary transition-all"
                              />
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black text-outline uppercase tracking-widest">Select Availability Slot</label>
                              <div className="grid grid-cols-1 gap-2">
                                {assignForm.doctorId ? (
                                  doctors.find(d => d.id === assignForm.doctorId)?.availability?.length > 0 ? (
                                    doctors.find(d => d.id === assignForm.doctorId).availability.map((slot: any, idx: number) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          const datePart = assignForm.appointmentDate.split('T')[0] || new Date().toISOString().split('T')[0];
                                          setAssignForm({...assignForm, appointmentDate: `${datePart}T${slot.start}`});
                                        }}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                                          assignForm.appointmentDate.includes(slot.start) 
                                          ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                                          : 'border-outline-variant hover:border-primary/50 text-outline'
                                        }`}
                                      >
                                        <span>{slot.start} — {slot.end}</span>
                                        {assignForm.appointmentDate.includes(slot.start) && <CheckCircle2 className="w-4 h-4" />}
                                      </button>
                                    ))
                                  ) : (
                                    <p className="text-[10px] text-error font-bold italic p-2 italic bg-error/5 rounded-lg border border-error/10">No slots defined for this physician.</p>
                                  )
                                ) : (
                                  <p className="text-[10px] text-outline italic p-2 bg-surface-container rounded-lg border border-outline-variant/30">Select a physician first...</p>
                                )}
                              </div>
                            </div>

                            <button 
                              disabled={!assignForm.doctorId || !assignForm.appointmentDate}
                              onClick={() => handleAssign(selectedPatient.id, assignForm.doctorId, assignForm.appointmentDate)}
                              className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              Confirm Assignment
                            </button>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Clinical Assessment</p>
                            <div className="space-y-3">
                              {selectedPatient.triage?.summary ? selectedPatient.triage.summary.map((s: string, i: number) => (
                                <div key={i} className="flex gap-3 text-sm font-medium text-on-surface-variant leading-relaxed">
                                  <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0"></div>
                                  {s}
                                </div>
                              )) : <p className="text-xs italic text-outline">No AI summary available.</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 py-20">
                        <AlertCircle className="w-12 h-12 mb-4" />
                        <p className="font-bold text-outline uppercase tracking-[0.2em] text-[10px]">Select a patient card to assign care</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold">Patient History</h3>
                  <p className="text-on-surface-variant text-sm">Review recently processed and assigned triage cases.</p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-outline-variant overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Patient</th>
                      <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Primary Issue</th>
                      <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Urgency</th>
                      <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Assigned To</th>
                      <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Scheduled</th>
                      <th className="px-6 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.filter(p => p.status === 'ASSIGNED' || p.status === 'COMPLETED').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-outline italic text-sm font-medium">
                          No history records found.
                        </td>
                      </tr>
                    ) : queue.filter(p => p.status === 'ASSIGNED' || p.status === 'COMPLETED').map(req => (
                      <tr key={req.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {req.id.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-sm text-on-surface">#{req.id.slice(0, 5)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-on-surface-variant max-w-xs truncate italic">"{req.primaryProblem}"</td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getUrgencyStyles(req.triage?.urgency)}`}>
                            {req.triage?.urgency || 'ROUTINE'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-bold text-on-surface">{req.triage?.assignedDoctor || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-xs font-bold text-outline uppercase tracking-wider">
                          {req.triage?.appointmentDate ? new Date(req.triage.appointmentDate).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-5">
                          <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${req.status === 'COMPLETED' ? 'text-secondary' : 'text-primary'}`}>
                            {req.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {req.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="animate-fade">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold">Medical Staff</h3>
                  <p className="text-on-surface-variant text-sm">Manage active physicians and specialists.</p>
                </div>
                <button onClick={() => setShowDocModal(true)} className="btn-primary flex items-center gap-2 px-6 py-3 w-full sm:w-auto justify-center">
                  <Plus className="w-5 h-5" /> Onboard Specialist
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {doctors.map(doc => (
                  <div 
                    key={doc.id} 
                    onClick={() => handleManageAvailability(doc)}
                    className="ambient-shadow-card p-6 lg:p-8 flex flex-col items-center text-center relative group cursor-pointer hover:border-primary/50 transition-all border-2 border-transparent"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteDoctor(doc.id); }} 
                      className="absolute top-4 right-4 p-2 text-outline hover:text-error lg:opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                      <Users className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-lg mb-1">{doc.name}</h4>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">{doc.specialization}</p>
                    
                    <div className="space-y-2 w-full">
                      {doc.availability && doc.availability.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {doc.availability.map((slot: any, idx: number) => (
                            <span key={idx} className="text-[9px] font-bold bg-surface-container px-2 py-1 rounded-md text-outline">
                              {slot.start} - {slot.end}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-outline italic">No slots defined</p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                      Available
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Doctor Onboarding Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade">
          <div className="bg-white rounded-[2rem] border border-outline-variant p-6 lg:p-10 w-full max-w-md shadow-ambient-elevated">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-2xl font-bold">New Specialist</h2>
              <button onClick={() => setShowDocModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveDoctor} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest">Full Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Dr. Sarah Smith"
                  className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary outline-none transition-all text-sm" 
                  value={docForm.name}
                  onChange={(e) => setDocForm({...docForm, name: e.target.value})} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest">Specialization</label>
                <select 
                  className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl outline-none cursor-pointer focus:border-primary text-sm appearance-none"
                  value={docForm.specialty}
                  onChange={(e) => setDocForm({...docForm, specialty: e.target.value})}
                >
                  <option>General Physician</option>
                  <option>Cardiologist</option>
                  <option>Neurologist</option>
                  <option>Orthopedic</option>
                  <option>ENT Specialist</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all mt-4">
                Confirm Onboarding
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Availability Management Modal */}
      {showAvailabilityModal && selectedDoctor && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade">
          <div className="bg-white rounded-[2rem] border border-outline-variant p-6 lg:p-10 w-full max-w-md shadow-ambient-elevated">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-headline text-2xl font-bold">{selectedDoctor.name}</h2>
                <p className="text-on-surface-variant text-sm">Manage operative time slots</p>
              </div>
              <button onClick={() => setShowAvailabilityModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50">
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Add New Slot</p>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-outline uppercase ml-2 mb-1 block">Start</label>
                    <input 
                      type="time" 
                      value={newSlot.start}
                      onChange={(e) => setNewSlot({...newSlot, start: e.target.value})}
                      className="w-full p-2.5 bg-white border border-outline-variant rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-outline uppercase ml-2 mb-1 block">End</label>
                    <input 
                      type="time" 
                      value={newSlot.end}
                      onChange={(e) => setNewSlot({...newSlot, end: e.target.value})}
                      className="w-full p-2.5 bg-white border border-outline-variant rounded-xl text-xs font-bold"
                    />
                  </div>
                  <button 
                    onClick={addTimeSlot}
                    className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:brightness-110 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {availabilitySlots.length === 0 ? (
                  <p className="text-center py-8 text-outline text-xs italic">No active slots defined for this node.</p>
                ) : (
                  availabilitySlots.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/30 group">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-bold text-sm text-on-surface">{slot.start} — {slot.end}</span>
                      </div>
                      <button onClick={() => removeTimeSlot(i)} className="p-1.5 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAvailabilityModal(false)} className="flex-1 py-4 text-outline font-bold text-sm">Cancel</button>
                <button 
                  onClick={saveAvailability}
                  className="flex-[2] py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
