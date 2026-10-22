import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Mail, Shield, CheckCircle, Clock, Eye, Trash2, Briefcase } from 'lucide-react';
import demoService from '../../../services/demoService';
import DataTable from '../../../components/tables/DataTable';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import PageHeader from '../../../components/layout/PageHeader';

export default function HRManagement() {
  const [hrUsers, setHrUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('Senior HR Talent Specialist');
  const [interviewerNumber, setInterviewerNumber] = useState(1);
  const [formError, setFormError] = useState('');

  const loadData = () => {
    const allUsers = demoService.getUsers();
    const hrs = allUsers.filter((u) => u.role === 'hr');
    setHrUsers(hrs);
    setAssignments(demoService.getInterviewAssignments());
    setEvaluations(demoService.getInterviewEvaluations());
    setInterviewerNumber(hrs.length + 1);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteHR = (hrUser) => {
    if (window.confirm(`Are you sure you want to delete HR Interviewer account "${hrUser.name}"?`)) {
      try {
        demoService.deleteHRUser(hrUser.id);
        loadData();
      } catch (err) {
        alert(err.message || 'Error deleting HR user');
      }
    }
  };

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setTitle('Senior HR Talent Specialist');
    setInterviewerNumber(hrUsers.length + 1);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddHR = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setFormError('Email address is required.');
      return;
    }

    try {
      demoService.addHRUser({
        name: name.trim(),
        email: email.trim(),
        title: title.trim() || 'HR Interviewer',
        interviewerNumber: Number(interviewerNumber) || (hrUsers.length + 1),
      });

      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      loadData();
    } catch (err) {
      setFormError(err.message || 'Error creating HR Interviewer account');
    }
  };

  const columns = [
    {
      header: 'HR Interviewer',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
            {row.avatar || row.name?.slice(0, 2).toUpperCase() || 'HR'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.title || 'HR Talent Specialist'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      key: 'email',
      render: (row) => <span className="text-xs text-slate-600 font-mono">{row.email}</span>,
    },
    {
      header: 'Interviewer Slot',
      key: 'interviewerNumber',
      sortable: true,
      render: (row) => (
        <Badge variant="blue" size="sm">
          HR {row.interviewerNumber || (hrUsers.indexOf(row) + 1)}
        </Badge>
      ),
    },
    {
      header: 'Assigned Candidates',
      key: 'assigned',
      render: (row) => {
        const assigned = assignments.filter((a) => a.hrId === row.id);
        return <span className="font-semibold text-slate-800 text-xs">{assigned.length} Candidates</span>;
      },
    },
    {
      header: 'Interviews Completed',
      key: 'completed',
      render: (row) => {
        const assigned = assignments.filter((a) => a.hrId === row.id);
        const done = evaluations.filter((e) => e.hrId === row.id && e.status === 'submitted').length;
        return (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            {done} / {assigned.length} Completed
          </span>
        );
      },
    },
    {
      header: 'Account Status',
      key: 'isActive',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'gray'} size="sm">
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          title="Delete HR Interviewer"
          onClick={() => handleDeleteHR(row)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Interviewers Directory"
        subtitle="Manage corporate talent acquisition leaders and behavioral evaluators presiding over Round 2 personal interviews."
        breadcrumbs={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'HR Interviewers' }]}
        actions={
          <Button variant="primary" icon={UserPlus} onClick={handleOpenAddModal}>
            Add HR Interviewer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={hrUsers}
        searchPlaceholder="Search HR interviewers by name, email, or designation..."
        searchKeys={['name', 'email', 'title']}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New HR Interviewer"
        subtitle="The interviewer will be able to log in to the HR Portal, interview qualified candidates, and submit ratings."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddHR}>
              Save HR Interviewer
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddHR} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Full Name & Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Meera Ramanathan"
            required
          />
          <Input
            label="Email Address (Login Username)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. hr3@placepro.demo"
            required
          />
          <Input
            label="Corporate Designation / Department"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. VP Talent Acquisition, FinTech Operations"
          />
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Interviewer Slot Assignment
            </label>
            <select
              value={interviewerNumber}
              onChange={(e) => setInterviewerNumber(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={1}>HR 1 (Primary Recruiter)</option>
              <option value={2}>HR 2 (Secondary Recruiter)</option>
              <option value={3}>HR 3 (Panel Interviewer)</option>
              <option value={4}>HR 4 (External Specialist)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
