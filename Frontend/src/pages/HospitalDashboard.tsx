import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Stethoscope, Briefcase, Plus, Trash2, X, UserCheck, Clock, User, RefreshCw
} from 'lucide-react';

const HospitalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'assigned' | 'staff'>('pending');
  const [queue, setQueue] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ name: '', specialty: 'General Physician' });
  const [assignForm, setAssignForm] = useState({ doctorId: '', appointmentDate: '' });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const qRes = await fetch('http://localhost:8000/api/hospital/queue');
      const qData = await qRes.json();
      if (Array.isArray(qData)) setQueue(qData);

      const dRes = await fetch('http://localhost:8000/api/hospital/doctors');
      const dData = await dRes.json();
      if (Array.isArray(dData)) setDoctors(dData);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleAssign = async (patientId: string, doctorId: string, appointmentDate: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    try {
      // 1. Update Database
      const response = await fetch('http://localhost:8000/api/hospital/assign-doctor', {
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
        // 2. INSTANT UI UPDATE: Update the local list so it shows immediately
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

        // 3. Update the detail view
        if (selectedPatient?.id === patientId) {
          setSelectedPatient(prev => ({
            ...prev,
            status: 'ASSIGNED',
            triage: { ...prev.triage, assignedDoctor: doctor.name, appointmentDate }
          }));
        }
        
        setAssignForm({ doctorId: '', appointmentDate: '' });
      }
    } catch (error) { console.error(error); }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/hospital/doctors/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      if (res.ok) {
        setShowDocModal(false);
        fetchData();
        setDocForm({ name: '', specialty: 'General Physician' });
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteDoctor = async (docId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/hospital/doctors/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const pendingPatients = queue.filter(p => p.status === 'PENDING');
  const assignedPatients = queue.filter(p => p.status === 'ASSIGNED');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-['Outfit']">
      {/* Sidebar Navigation */}
      <div className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-8 bg-[#0a0a0a]">
        <div className="p-3 bg-emerald-500 rounded-2xl text-black shadow-lg shadow-emerald-500/20"><Stethoscope size={24} /></div>
        <div className="flex flex-col gap-4 mt-10">
          <button onClick={() => { setActiveTab('pending'); setSelectedPatient(null); }} className={`p-4 rounded-2xl transition ${activeTab === 'pending' ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-500 hover:text-white'}`}><Clock size={24} /></button>
          <button onClick={() => { setActiveTab('assigned'); setSelectedPatient(null); }} className={`p-4 rounded-2xl transition ${activeTab === 'assigned' ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-500 hover:text-white'}`}><UserCheck size={24} /></button>
          <button onClick={() => { setActiveTab('staff'); setSelectedPatient(null); }} className={`p-4 rounded-2xl transition ${activeTab === 'staff' ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-500 hover:text-white'}`}><Briefcase size={24} /></button>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hospital <span className="text-emerald-500">{activeTab === 'pending' ? 'Queue' : activeTab === 'assigned' ? 'Treatment' : 'Staff'}</span></h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-zinc-500 text-sm font-medium">{activeTab === 'pending' ? `${pendingPatients.length} Waiting` : activeTab === 'assigned' ? `${assignedPatients.length} Under Care` : `${doctors.length} Doctors`}</span>
               <button onClick={fetchData} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition"><RefreshCw size={14} /></button>
            </div>
          </div>
          {activeTab === 'staff' && (
            <button onClick={() => setShowDocModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Specialist</button>
          )}
        </header>

        {(activeTab === 'pending' || activeTab === 'assigned') ? (
          <div className="grid lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
            <div className="lg:col-span-4 glass-card overflow-hidden flex flex-col p-4 space-y-3">
                <div className="p-2 text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">{activeTab === 'pending' ? 'Needs Attention' : 'Active Sessions'}</div>
                {(activeTab === 'pending' ? pendingPatients : assignedPatients).map(p => (
                  <div key={p.id} onClick={() => setSelectedPatient(p)} className={`p-4 rounded-2xl border cursor-pointer transition ${selectedPatient?.id === p.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold">Patient #{p.id.slice(0, 5)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${p.status === 'ASSIGNED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-white/10'}`}>{p.status}</span>
                    </div>
                    {/* ENHANCED DOCTOR BADGE */}
                    {p.triage?.assignedDoctor && (
                       <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase mb-3 border border-emerald-500/10">
                          <User size={12} /> {p.triage.assignedDoctor}
                       </div>
                    )}
                    <p className="text-xs text-zinc-500 truncate leading-relaxed italic">"{p.primaryProblem}"</p>
                  </div>
                ))}
            </div>

            <div className="lg:col-span-8 glass-card flex flex-col relative overflow-hidden">
                {selectedPatient ? (
                  <div className="animate-fade h-full flex flex-col">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                      <div>
                        <h2 className="text-2xl font-bold">Diagnostic File</h2>
                        <div className="mt-2">
                          {selectedPatient.triage?.assignedDoctor ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500 text-black rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                              <UserCheck size={14} /> Assigned: {selectedPatient.triage.assignedDoctor}
                              {selectedPatient.triage.appointmentDate && ` • ${new Date(selectedPatient.triage.appointmentDate).toLocaleString()}`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                              <Clock size={14} /> Awaiting Doctor
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!selectedPatient.triage?.assignedDoctor && (
                        <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                          <select 
                            value={assignForm.doctorId}
                            onChange={(e) => setAssignForm({...assignForm, doctorId: e.target.value})}
                            className="bg-zinc-900 text-white p-2 text-sm rounded-lg outline-none border border-white/10"
                          >
                            <option value="">Select Doctor...</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                          </select>
                          <input 
                            type="datetime-local" 
                            value={assignForm.appointmentDate}
                            onChange={(e) => setAssignForm({...assignForm, appointmentDate: e.target.value})}
                            className="bg-zinc-900 text-white p-2 text-sm rounded-lg outline-none border border-white/10"
                            style={{ colorScheme: "dark" }}
                          />
                          <button 
                            disabled={!assignForm.doctorId || !assignForm.appointmentDate}
                            onClick={() => handleAssign(selectedPatient.id, assignForm.doctorId, assignForm.appointmentDate)}
                            className="bg-emerald-500 text-black font-bold p-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-emerald-400"
                          >
                            Confirm Appointment
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                        <section>
                           <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Initial Complaint</h4>
                           <div className="p-6 bg-black/40 border border-white/5 rounded-2xl italic text-zinc-300 text-lg leading-relaxed">"{selectedPatient.primaryProblem}"</div>
                        </section>
                        <section>
                           <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Clinical AI Summary</h4>
                           <div className="grid gap-3">
                              {selectedPatient.triage?.summary ? (
                                selectedPatient.triage.summary.map((pt: string, i: number) => (
                                  <div key={i} className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex gap-4 items-start">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                     <span className="text-zinc-300 text-sm font-medium leading-relaxed">{pt}</span>
                                  </div>
                                ))
                              ) : <div className="p-4 text-zinc-600 text-xs italic">No clinical assessment available.</div>}
                           </div>
                        </section>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 uppercase font-black tracking-[0.5em] text-sm">Select Profile</div>
                )}
            </div>
          </div>
        ) : (
          /* Staff Management View */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade">
             {doctors.map(doc => (
              <div key={doc.id} className="glass-card p-6 flex flex-col items-center text-center relative group">
                <button onClick={() => handleDeleteDoctor(doc.id)} className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20 shadow-inner"><Briefcase size={28} /></div>
                <h3 className="text-lg font-bold mb-1">{doc.name}</h3>
                <p className="text-zinc-500 text-xs mb-3 font-medium uppercase tracking-wider">{doc.specialization}</p>
                <div className="text-[10px] font-black tracking-widest uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">ON DUTY</div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for adding/editing doctors */}
        {showDocModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade">
            <div className="glass-card p-8 w-full max-w-md border-emerald-500/20">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Add Specialist</h2>
                <button onClick={() => setShowDocModal(false)} className="text-zinc-500 hover:text-white transition"><X /></button>
              </div>
              <form onSubmit={handleSaveDoctor} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Doctor Name</label>
                  <input required type="text" className="w-full p-4 bg-black/40 border border-white/5 rounded-xl focus:border-emerald-500 outline-none text-white transition" onChange={(e) => setDocForm({...docForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Specialization</label>
                  <select className="w-full p-4 bg-black/40 border border-white/5 rounded-xl outline-none text-white cursor-pointer" onChange={(e) => setDocForm({...docForm, specialty: e.target.value})}>
                    <option>General Physician</option><option>Cardiologist</option><option>Neurologist</option><option>ENT Specialist</option><option>Orthopedic</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full py-4 text-lg font-bold mt-4">Confirm Onboarding</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
