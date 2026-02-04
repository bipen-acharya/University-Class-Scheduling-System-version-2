import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2,
  X,
  UserPlus,
  Info,
  Shield,
  Eye as EyeIcon
} from 'lucide-react';
import { mockUsers, User } from '../../data/mockData';
import { toast } from 'sonner@2.0.3';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Observer' as 'Admin' | 'Observer',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'Observer',
      status: 'Active'
    });
  };

  // Handle Add User
  const handleAddUser = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const newUser: User = {
      id: `u${users.length + 1}`,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      createdOn: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, newUser]);
    toast.success(`User ${formData.fullName} has been added successfully`);
    setShowAddDrawer(false);
    resetForm();
  };

  // Handle Edit User
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: '',
      confirmPassword: '',
      role: user.role,
      status: user.status
    });
    setShowEditDrawer(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const updatedUsers = users.map(user =>
      user.id === selectedUser.id
        ? { ...user, fullName: formData.fullName, email: formData.email, phone: formData.phone, role: formData.role, status: formData.status }
        : user
    );

    setUsers(updatedUsers);
    toast.success(`User ${formData.fullName} has been updated successfully`);
    setShowEditDrawer(false);
    setSelectedUser(null);
    resetForm();
  };

  // Handle View User
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Handle Delete User
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      const userToDelete = users.find(u => u.id === deleteTargetId);
      setUsers(users.filter(user => user.id !== deleteTargetId));
      toast.success(`User ${userToDelete?.fullName} has been deleted successfully`);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const observerCount = users.filter(u => u.role === 'Observer').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-dark mb-2">Users Management</h1>
          <p className="text-body">Manage system users and access roles for UniScheduling</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddDrawer(true);
          }}
          className="bg-primary-blue text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-card w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-light shadow-card">
          <div className="text-body text-sm mb-1">Total Users</div>
          <div className="text-dark text-3xl">{totalUsers}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-light shadow-card">
          <div className="text-body text-sm mb-1">Active Users</div>
          <div className="text-success text-3xl">{activeUsers}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-light shadow-card">
          <div className="text-body text-sm mb-1">Admins</div>
          <div className="text-primary-blue text-3xl">{adminCount}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-light shadow-card">
          <div className="text-body text-sm mb-1">Observers</div>
          <div className="text-body text-3xl">{observerCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-light shadow-card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-body" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body min-w-[150px]"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Observer">Observer</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white text-body min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Clear Filters */}
          {(searchTerm || filterRole || filterStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
                setFilterStatus('');
              }}
              className="px-4 py-3 border border-light rounded-xl hover:bg-soft transition-colors text-body"
            >
              Clear
            </button>
          )}
        </div>

        {/* Role Info */}
        <div className="mt-4 p-4 bg-soft rounded-lg border border-light">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-primary-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="text-dark mb-2">Role Definitions:</div>
              <div className="space-y-1 text-body">
                <div><span className="text-primary-blue">• Admin:</span> Full system access - Can manage schedules, teachers, rooms, users, and settings</div>
                <div><span className="text-body">• Observer:</span> Read-only access - Can view schedules, timetables, and reports (cannot create, edit, or delete)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-light shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-soft border-b border-light">
                <th className="text-left px-6 py-4 text-sm text-dark">User</th>
                <th className="text-left px-6 py-4 text-sm text-dark">Phone Number</th>
                <th className="text-left px-6 py-4 text-sm text-dark">Role</th>
                <th className="text-left px-6 py-4 text-sm text-dark">Status</th>
                <th className="text-left px-6 py-4 text-sm text-dark">Created On</th>
                <th className="text-left px-6 py-4 text-sm text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-light hover:bg-soft transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-blue text-white flex items-center justify-center flex-shrink-0">
                        {getInitials(user.fullName)}
                      </div>
                      <div>
                        <div className="text-dark">{user.fullName}</div>
                        <div className="text-sm text-body">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                      user.role === 'Admin'
                        ? 'bg-blue-50 text-primary-blue'
                        : 'bg-gray-100 text-body'
                    }`}>
                      {user.role === 'Admin' && <Shield className="w-3.5 h-3.5" />}
                      {user.role === 'Observer' && <EyeIcon className="w-3.5 h-3.5" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      user.status === 'Active'
                        ? 'bg-green-50 text-success'
                        : 'bg-gray-100 text-body'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body">
                    {new Date(user.createdOn).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 hover:bg-soft rounded-lg transition-colors text-body hover:text-primary-blue"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 hover:bg-soft rounded-lg transition-colors text-body hover:text-primary-blue"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-body hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-body mx-auto mb-3 opacity-50" />
              <p className="text-body">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Drawer */}
      {showAddDrawer && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setShowAddDrawer(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-card-xl z-50 overflow-y-auto">
            <div className="p-6 border-b border-light flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-dark">Add New User</h2>
              <button
                onClick={() => setShowAddDrawer(false)}
                className="p-2 hover:bg-soft rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-dark mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="john.doe@university.edu"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'Observer' })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="Admin">Admin</option>
                  <option value="Observer">Observer</option>
                </select>
              </div>

              <div>
                <label className="block text-dark mb-2">Status</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, status: 'Active' })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      formData.status === 'Active'
                        ? 'bg-green-50 border-success text-success'
                        : 'border-light text-body hover:bg-soft'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      formData.status === 'Inactive'
                        ? 'bg-gray-100 border-gray-400 text-body'
                        : 'border-light text-body hover:bg-soft'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-light flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddDrawer(false)}
                className="flex-1 px-6 py-3 border border-light rounded-xl hover:bg-soft transition-colors text-body"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Create User
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit User Drawer */}
      {showEditDrawer && selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setShowEditDrawer(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-card-xl z-50 overflow-y-auto">
            <div className="p-6 border-b border-light flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-dark">Edit User</h2>
              <button
                onClick={() => setShowEditDrawer(false)}
                className="p-2 hover:bg-soft rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-dark mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div>
                <label className="block text-dark mb-2">
                  Reset Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {formData.password && (
                <div>
                  <label className="block text-dark mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-dark mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'Observer' })}
                  className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="Admin">Admin</option>
                  <option value="Observer">Observer</option>
                </select>
              </div>

              <div>
                <label className="block text-dark mb-2">Status</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, status: 'Active' })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      formData.status === 'Active'
                        ? 'bg-green-50 border-success text-success'
                        : 'border-light text-body hover:bg-soft'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      formData.status === 'Inactive'
                        ? 'bg-gray-100 border-gray-400 text-body'
                        : 'border-light text-body hover:bg-soft'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-light flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditDrawer(false)}
                className="flex-1 px-6 py-3 border border-light rounded-xl hover:bg-soft transition-colors text-body"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Update User
              </button>
            </div>
          </div>
        </>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-card-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-light flex items-center justify-between">
                <h2 className="text-dark">User Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-soft rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-blue text-white flex items-center justify-center text-xl">
                    {getInitials(selectedUser.fullName)}
                  </div>
                  <div>
                    <div className="text-dark text-xl">{selectedUser.fullName}</div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm mt-1 ${
                      selectedUser.role === 'Admin'
                        ? 'bg-blue-50 text-primary-blue'
                        : 'bg-gray-100 text-body'
                    }`}>
                      {selectedUser.role === 'Admin' && <Shield className="w-3.5 h-3.5" />}
                      {selectedUser.role === 'Observer' && <EyeIcon className="w-3.5 h-3.5" />}
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-body mb-1">Email</div>
                    <div className="text-dark">{selectedUser.email}</div>
                  </div>

                  <div>
                    <div className="text-sm text-body mb-1">Phone</div>
                    <div className="text-dark">{selectedUser.phone}</div>
                  </div>

                  <div>
                    <div className="text-sm text-body mb-1">Status</div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      selectedUser.status === 'Active'
                        ? 'bg-green-50 text-success'
                        : 'bg-gray-100 text-body'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm text-body mb-1">Created On</div>
                    <div className="text-dark">
                      {new Date(selectedUser.createdOn).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-light flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditClick(selectedUser);
                  }}
                  className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-card-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-dark text-center mb-2">Delete User</h2>
                <p className="text-body text-center mb-6">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-6 py-3 border border-light rounded-xl hover:bg-soft transition-colors text-body"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
