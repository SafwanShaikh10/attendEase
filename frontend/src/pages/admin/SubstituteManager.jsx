import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserPlus, 
  ShieldCheck, 
  Calendar, 
  Trash2, 
  UserCog, 
  Users,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { getSubstitutes, createSubstitute, deactivateSubstitute, getUsers } from '../../api/admin';

const SubstituteManager = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    originalCoordinatorId: '',
    substituteUserId: '',
    asRole: 'CLASS_COORD',
    expiresAt: ''
  });

  const { data: substitutes = [], isLoading } = useQuery({
    queryKey: ['substitutes'],
    queryFn: getSubstitutes,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: createSubstitute,
    onSuccess: () => {
      queryClient.invalidateQueries(['substitutes']);
      setShowAddForm(false);
      setFormData({ originalCoordinatorId: '', substituteUserId: '', asRole: 'CLASS_COORD', expiresAt: '' });
    },
    onError: (err) => alert(err.response?.data?.error || "Failed to create substitute")
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateSubstitute,
    onSuccess: () => queryClient.invalidateQueries(['substitutes'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.originalCoordinatorId || !formData.substituteUserId || !formData.expiresAt) {
      return alert("All fields are mandatory.");
    }
    createMutation.mutate({
      ...formData,
      originalCoordinatorId: parseInt(formData.originalCoordinatorId),
      substituteUserId: parseInt(formData.substituteUserId),
      expiresAt: new Date(formData.expiresAt).toISOString()
    });
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse text-indigo-600 font-medium">Loading substitute data...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Substitute Management</h1>
          <p className="text-gray-500 mt-1">Delegate approval authorities during coordinator absence.</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Assign New Substitute
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border border-indigo-100 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Assign New Substitute</h2>
            <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Absent Coordinator</label>
              <select 
                value={formData.originalCoordinatorId}
                onChange={(e) => setFormData({...formData, originalCoordinatorId: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="">Select User</option>
                {users.filter(u => u.role !== 'STUDENT').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Substitute User</label>
              <select 
                value={formData.substituteUserId}
                onChange={(e) => setFormData({...formData, substituteUserId: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Substitute Role</label>
              <select 
                value={formData.asRole}
                onChange={(e) => setFormData({...formData, asRole: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="CLASS_COORD">CLASS_COORD</option>
                <option value="YEAR_COORD">YEAR_COORD</option>
                <option value="CHAIRPERSON">CHAIRPERSON</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry Date & Time</label>
              <input 
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-1">
              <button 
                type="submit"
                disabled={createMutation.isLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> {createMutation.isLoading ? 'Assigning...' : 'Assign Substitute'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Substitutes Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <h3 className="font-bold text-gray-800 tracking-tight">Active Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-4">Absent Staff</th>
                <th className="px-8 py-4">Substitute Staff</th>
                <th className="px-8 py-4">Acting As</th>
                <th className="px-8 py-4">Expires</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {substitutes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    No active substitute assignments found.
                  </td>
                </tr>
              ) : (
                substitutes.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{sub.originalCoordinator?.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{sub.originalCoordinator?.role}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-indigo-600">{sub.substituteUser?.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">User #{sub.substituteUserId}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-tight rounded">
                        {sub.asRole}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sub.expiresAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {sub.isActive ? (
                        <button 
                          onClick={() => deactivateMutation.mutate(sub.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors border border-rose-100 opacity-0 group-hover:opacity-100"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Policy Note</h4>
          <p className="text-xs text-amber-700/60 leading-relaxed mt-1">
            Assigning a substitute allows the designated user to perform actions matching the chosen role. All actions are logged with "Performed As SUBSTITUTE" in the audit trail. Access automatically expires at the specified time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubstituteManager;
