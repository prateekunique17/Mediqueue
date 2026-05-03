import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  Stethoscope, 
  Clock, 
  History, 
  ChevronRight, 
  Send,
  Bell,
  Settings,
  ArrowUpRight,
  Activity,
  X,
  CheckCircle2,
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Building2,
  Calendar,
  ClipboardList,
  ExternalLink
} from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickSymptom, setQuickSymptom] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [activeTriageData, setActiveTriageData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Analysis');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const { data: reqData } = await supabase
      .from('triage_requests')
      .select('*')
      .eq('patientId', user.id)
      .order('createdAt', { ascending: false });

    if (reqData) setRequests(reqData);

    const { data: appData } = await supabase
      .from('appointments')
      .select('*')
      .eq('patientId', user.id)
      .neq('status', 'COMPLETED')
      .order('timeSlot', { ascending: true });

    if (appData) setAppointments(appData);
    setLoading(false);
  };

  const handleCompleteAppointment = async (appId: string) => {
    try {
      const { data: appData } = await supabase
        .from('appointments')
        .select('patientRequestId')
        .eq('id', appId)
        .single();

      const { error: appError } = await supabase
        .from('appointments')
        .update({ status: 'COMPLETED' })
        .eq('id', appId);

      if (appError) throw appError;

      if (appData?.patientRequestId) {
        await supabase
          .from('triage_requests')
          .update({ status: 'COMPLETED' })
          .eq('id', appData.patientRequestId);
      }
      
      toast.success("Appointment marked as completed!");
      fetchData(); 
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSymptom.trim()) {
      navigate(`/request?q=${encodeURIComponent(quickSymptom)}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4ed5]"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING').map(r => ({
    id: `req-${r.id}`,
    isRequest: true,
    patientRequestId: r.id,
    status: 'PENDING',
    timeSlot: r.createdAt, 
    doctorName: 'Pending Assignment',
    hospitalName: r.selectedHospital || 'Processing...',
    originalRequest: r
  }));

  const allActiveItems = [...appointments, ...pendingRequests].sort((a, b) => new Date(a.timeSlot).getTime() - new Date(b.timeSlot).getTime());
  const activeAppointments = allActiveItems.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 font-body antialiased flex flex-col">


      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[240px] bg-[#f8f9fc] border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto hidden md:flex">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0f4ed5] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm text-slate-800 truncate">City General</h2>
                <p className="text-xs text-slate-500 truncate">Emergency Dept.</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <button 
              onClick={() => setActiveTab('History')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'History' ? 'bg-blue-50 text-[#0f4ed5] font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <History className="w-4 h-4" /> History
            </button>
            <button 
              onClick={() => setActiveTab('Analysis')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'Analysis' ? 'bg-blue-50 text-[#0f4ed5] font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Activity className="w-4 h-4" /> Analysis
            </button>
            <button 
              onClick={() => setActiveTab('Schedule')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'Schedule' ? 'bg-blue-50 text-[#0f4ed5] font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Calendar className="w-4 h-4" /> Schedule
            </button>
            <button 
              onClick={() => setActiveTab('Reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'Reports' ? 'bg-blue-50 text-[#0f4ed5] font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <FileText className="w-4 h-4" /> Reports
            </button>

            <div className="pt-4 pb-2">
              <div className="w-full h-px bg-slate-200"></div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-sm hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-4 h-4" /> Emergency Mode
            </button>
          </nav>

          <div className="p-4 mt-auto space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
              <HelpCircle className="w-4 h-4" /> Help Center
            </a>
            <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 bg-white overflow-y-auto p-8 relative">
          
          {activeTab === 'Analysis' && (
            <div className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-8 animate-fade">
              
              {/* Left Content Column */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <h1 className="font-headline text-2xl font-bold text-slate-800 mb-1">
                    Welcome back, {user?.displayName?.split(' ')[0] || 'Sarah'}
                  </h1>
                  <p className="text-slate-500 text-sm">Here is your medical overview and clinical analysis.</p>
                </div>

                {/* Blue Banner */}
                <div className="bg-gradient-to-br from-[#0f4ed5] to-[#1e61f0] rounded-2xl p-8 text-white flex justify-between items-center relative overflow-hidden shadow-sm">
                  <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
                  
                  <div className="relative z-10 max-w-sm">
                    <h2 className="text-xl font-bold mb-2">Need to see a specialist?</h2>
                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">Book an appointment online or request a fast-track triage assessment based on your symptoms.</p>
                    <Link to="/request" className="inline-flex items-center gap-2 bg-white text-[#0f4ed5] px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                      <CalendarDays className="w-4 h-4" />
                      Request Appointment
                    </Link>
                  </div>

                  <div className="relative z-10 hidden sm:flex w-20 h-20 bg-white/10 rounded-full items-center justify-center border border-white/20 backdrop-blur-sm mr-4">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Upcoming Appointments Section */}
                <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm mt-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Upcoming Appointments</h3>
                    <button onClick={() => setActiveTab('Schedule')} className="text-[#0f4ed5] text-sm font-semibold hover:underline flex items-center gap-1">
                      View Calendar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeAppointments.length === 0 ? (
                      <div className="col-span-full py-8 text-center border border-dashed border-slate-300 rounded-xl">
                        <p className="text-slate-500 text-sm">No upcoming appointments.</p>
                      </div>
                    ) : activeAppointments.map(app => {
                      const d = new Date(app.timeSlot);
                      return (
                        <div 
                          key={app.id} 
                          onClick={() => {
                            setSelectedAppointment(app);
                            const tData = app.isRequest ? app.originalRequest : requests.find(r => r.id === app.patientRequestId);
                            setActiveTriageData(tData);
                          }}
                          className="border border-slate-200 rounded-xl p-5 hover:border-[#0f4ed5] hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col h-full"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl w-12 h-12 flex flex-col items-center justify-center text-[#0f4ed5]">
                              <span className="text-[10px] font-black uppercase leading-none mb-1">{d.toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {app.status === 'CONFIRMED' ? 'Confirmed' : app.status === 'SCHEDULED' ? 'Scheduled' : 'Pending'}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-slate-800 mb-1">{app.doctorName || 'General Follow-up'}</h4>
                          <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                            <Clock className="w-4 h-4" />
                            <span>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <Stethoscope className="w-3 h-3 text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-600 font-medium truncate">
                              {app.hospitalName || 'City General Clinic'}
                            </p>
                          </div>
                          
                          {app.status === 'SCHEDULED' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(app.id); }}
                              className="mt-4 w-full py-2 bg-[#0f4ed5] text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors"
                            >
                              Complete Visit
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick AI Check Card Inline */}
                <div className="bg-[#eef2fc] rounded-2xl p-6 relative overflow-hidden border border-blue-50 w-full mt-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white text-[#0f4ed5] flex items-center justify-center shadow-sm">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">Quick AI Check</h3>
                      <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Powered by Mediqueue AI</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed relative z-10">
                    Experiencing new symptoms? Run a quick preliminary check before booking.
                  </p>
                  <form onSubmit={handleQuickCheck} className="relative z-10 mb-4 flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm focus-within:border-[#0f4ed5] transition-colors">
                    <input 
                      className="flex-1 bg-transparent border-none text-sm px-3 py-1.5 focus:outline-none text-slate-800 placeholder:text-slate-400"
                      placeholder="E.g., mild headache and..."
                      value={quickSymptom}
                      onChange={(e) => setQuickSymptom(e.target.value)}
                    />
                    <button type="submit" className="p-1.5 bg-blue-50 text-[#0f4ed5] rounded-md hover:bg-blue-100 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">Sore throat</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">Fever</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">Joint pain</span>
                  </div>
                </div>
              </div>

              {/* Right Content Column */}
              <div className="xl:w-[350px] shrink-0 flex flex-col gap-6">
                
                {/* Recent History Card */}
                <div className="border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Recent Analysis</h3>
                    <button onClick={() => setActiveTab('History')} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 flex flex-col gap-6 relative">
                    {/* Vertical Line for timeline */}
                    <div className="absolute left-[39px] top-8 bottom-8 w-px bg-slate-200"></div>
                    
                    {requests.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No recent history.</p>
                    ) : requests.slice(0, 3).map((req) => (
                      <div key={req.id} className="flex gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[#0f4ed5] shrink-0 z-10">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <div className="pt-1">
                          <h4 className="text-sm font-bold text-slate-800">{req.primaryProblem}</h4>
                          <p className="text-sm text-slate-600 mt-0.5">{req.triage?.doctorType || 'General Consultation'}</p>
                          <p className="text-xs text-slate-400 mt-1.5">{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric'})}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'Schedule' && (
            <div className="max-w-6xl mx-auto animate-fade">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">My Schedule</h2>
                <p className="text-slate-500 text-sm">View and manage your upcoming medical appointments.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {allActiveItems.length === 0 ? (
                  <div className="col-span-full py-16 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-slate-700 font-bold mb-1">No Appointments</h3>
                    <p className="text-slate-500 text-sm">You don't have any upcoming appointments scheduled.</p>
                  </div>
                ) : allActiveItems.map(app => {
                  const d = new Date(app.timeSlot);
                  return (
                    <div 
                      key={app.id} 
                      onClick={() => {
                        setSelectedAppointment(app);
                        const tData = app.isRequest ? app.originalRequest : requests.find(r => r.id === app.patientRequestId);
                        setActiveTriageData(tData);
                      }}
                      className="border border-slate-200 rounded-xl p-5 hover:border-[#0f4ed5] hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl w-12 h-12 flex flex-col items-center justify-center text-[#0f4ed5]">
                          <span className="text-[10px] font-black uppercase leading-none mb-1">{d.toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                          app.status === 'SCHEDULED' ? 'bg-blue-100 text-[#0f4ed5]' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status === 'CONFIRMED' ? 'Confirmed' : app.status === 'SCHEDULED' ? 'Scheduled' : 'Pending'}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 mb-1">{app.doctorName || 'General Follow-up'}</h4>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-3 h-3 text-slate-500" />
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">
                          {app.hospitalName || 'City General Clinic'}
                        </p>
                      </div>
                      
                      {app.status === 'SCHEDULED' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(app.id); }}
                          className="mt-4 w-full py-2 bg-[#0f4ed5] text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors"
                        >
                          Complete Visit
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'History' && (
            <div className="max-w-6xl mx-auto animate-fade">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Clinical History</h2>
                <p className="text-slate-500 text-sm">Review your past triage assessments and medical requests.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Symptom</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                          No history records found.
                        </td>
                      </tr>
                    ) : requests.map((req) => (
                      <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{req.primaryProblem}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{req.triage?.doctorType || 'General'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.triage?.urgency === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 
                            req.triage?.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' : 
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {req.triage?.urgency || 'ROUTINE'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-blue-100 text-[#0f4ed5]'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Reports' && (
            <div className="max-w-6xl mx-auto animate-fade flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                <FileText className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Medical Reports</h2>
              <p className="text-slate-500 max-w-md mx-auto">No lab reports or formal diagnostic documents have been uploaded to your profile yet.</p>
            </div>
          )}
          
          {/* Footer inside main */}
          <footer className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-semibold">© 2024 MEDIQUEUE AI. Clinical Precision Guaranteed.</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-600 transition-colors">HIPAA Compliance</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Contact Support</a>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Medical Details Modal */}
      {selectedAppointment && activeTriageData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0f4ed5] flex items-center justify-center text-white shadow-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Clinical Assessment</h2>
                  <p className="text-[10px] font-bold text-[#0f4ed5] uppercase tracking-widest mt-0.5">AI Triage Report</p>
                </div>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Appointment Meta */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex-1 min-w-[150px]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assigned Specialist</p>
                  <p className="font-bold text-sm text-slate-800">{selectedAppointment.doctorName || 'Senior Registrar'}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex-1 min-w-[150px]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Schedule</p>
                  <p className="font-bold text-sm text-slate-800">{new Date(selectedAppointment.timeSlot).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex-1 min-w-[150px]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-bold text-sm text-[#0f4ed5]">{selectedAppointment.status}</p>
                </div>
              </div>

              {/* Patient Input */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> Primary Symptom
                </h3>
                <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-[#0f4ed5]">
                  <p className="font-medium text-sm italic text-slate-700">"{activeTriageData.primaryProblem}"</p>
                </div>
              </div>

              {/* AI Output Breakdown */}
              {activeTriageData.triage && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> AI Diagnostics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Recommended Department</p>
                        <p className="font-bold text-sm text-[#0f4ed5]">{activeTriageData.triage.doctorType || 'General Consultation'}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assessed Urgency</p>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-block mt-1 ${
                          activeTriageData.triage.urgency === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 
                          activeTriageData.triage.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {activeTriageData.triage.urgency || 'ROUTINE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Clinical Summary
                    </h3>
                    <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
                      {activeTriageData.triage.summary ? activeTriageData.triage.summary.map((s: string, i: number) => (
                        <div key={i} className="flex gap-3 text-sm font-medium text-slate-600 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0f4ed5] mt-2 shrink-0"></div>
                          {s}
                        </div>
                      )) : <p className="text-sm italic text-slate-400">No detailed AI summary available.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              {selectedAppointment.status === 'SCHEDULED' && (
                <button 
                  onClick={() => {
                    handleCompleteAppointment(selectedAppointment.id);
                    setSelectedAppointment(null);
                  }}
                  className="px-6 py-2.5 bg-[#0f4ed5] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete Visit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
