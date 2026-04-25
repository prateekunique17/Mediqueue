import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Plus, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      // Fetch from Supabase instead of mock db
      const { data: reqData, error: reqError } = await supabase
        .from('triage_requests')
        .select('*')
        .eq('patientId', user.id)
        .order('createdAt', { ascending: false });

      if (!reqError && reqData) {
        setRequests(reqData);
      }

      const { data: appData, error: appError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patientId', user.id);

      if (!appError && appData) {
        setAppointments(appData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-bg text-text-primary">
      <div className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Hello, {user?.displayName?.split(' ')[0]}</h1>
          <p className="text-text-secondary font-medium mt-2">Manage your medical triage profile</p>
        </div>
        <Link to="/request" className="flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-black hover:brightness-110 transition shadow-2xl shadow-accent/20">
          <Plus className="w-5 h-5 stroke-[3px]" />
          NEW TRIAGE REQUEST
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Active Requests */}
          <section>
            <h2 className="text-sm font-black text-text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Clock className="text-accent w-4 h-4" />
              Active Triage Alerts
            </h2>
            <div className="space-y-6">
              {requests.length === 0 ? (
                <div className="p-16 text-center bg-card border border-dashed border-border rounded-[2.5rem]">
                   <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">No active alerts found.</p>
                </div>
              ) : requests.map(req => (
                <motion.div 
                   key={req.id}
                   whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                   className="bg-card p-8 rounded-[2rem] border border-border shadow-2xl transition"
                >
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <div className={
                            req.triage.urgency === 'EMERGENCY' ? 'badge-emergency' : 
                            req.triage.urgency === 'MODERATE' ? 'badge-moderate' : 'badge-routine'
                         }>
                            {req.triage.urgency}
                         </div>
                         <h3 className="text-xl font-bold mt-4 text-text-primary leading-tight max-w-md">{req.primaryProblem}</h3>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</div>
                         <div className="text-accent font-black text-[10px] uppercase mt-2 tracking-widest">{req.status.replace('_', ' ')}</div>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary bg-bg px-3 py-1.5 rounded-lg border border-border">
                         {req.triage.doctorType}
                      </div>
                      {req.location && <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary bg-bg px-3 py-1.5 rounded-lg border border-border">
                         {req.location}
                      </div>}
                   </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Medical History */}
          <section>
             <h2 className="text-sm font-black text-text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <CheckCircle className="text-accent w-4 h-4" />
                Medical History
             </h2>
             <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-bg/50 text-text-secondary text-[10px] uppercase font-black tracking-[0.1em]">
                      <tr>
                         <th className="px-8 py-5">Condition</th>
                         <th className="px-8 py-5">Specialization</th>
                         <th className="px-8 py-5">Verified On</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                      {requests.filter(r => r.status === 'COMPLETED').map(req => (
                         <tr key={req.id} className="hover:bg-white/5 transition">
                            <td className="px-8 py-6 font-bold text-text-primary">{req.primaryProblem}</td>
                            <td className="px-8 py-6 text-accent font-bold text-sm">{req.triage.doctorType}</td>
                            <td className="px-8 py-6 text-text-secondary font-medium text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
        </div>

        {/* Sidebar - Appointments */}
        <div className="space-y-12">
           <section>
              <h2 className="text-sm font-black text-text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Calendar className="text-accent w-4 h-4" />
                 Confirmed Appointments
              </h2>
              <div className="space-y-6">
                 {appointments.length === 0 ? (
                    <div className="p-12 text-center bg-card border border-border rounded-3xl">
                       <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">No scheduled sessions.</p>
                    </div>
                 ) : appointments.map(app => (
                    <div key={app.id} className="bg-accent text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                       <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition duration-700"></div>
                       <div className="flex justify-between items-start mb-6 relative">
                          <div className="bg-white/20 p-3 rounded-xl">
                             <Calendar className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">{app.status}</span>
                       </div>
                       <div className="mb-6 relative">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Attending Specialist</div>
                          <div className="text-2xl font-black mt-1 leading-tight">{app.doctorName || 'Senior Registrar'}</div>
                       </div>
                       <div className="grid grid-cols-2 gap-6 relative mb-6">
                          <div>
                             <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Schedule</div>
                             <div className="text-sm font-bold mt-1">{new Date(app.timeSlot).toLocaleDateString()}</div>
                             <div className="text-xs font-medium opacity-80">{new Date(app.timeSlot).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                          <div>
                             <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Facility</div>
                             <div className="text-sm font-bold mt-1 truncate">{app.hospitalName || 'Health Center'}</div>
                          </div>
                       </div>
                       {app.precautions && (
                         <div className="relative p-4 bg-white/10 rounded-2xl border border-white/20 text-white">
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Pre-Visit Note</div>
                            <p className="text-[11px] font-medium leading-relaxed">{app.precautions}</p>
                         </div>
                       )}
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
