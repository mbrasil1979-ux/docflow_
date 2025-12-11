import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DocumentStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, FileStack } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { documents } = useStore();

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + 30);
    const warningThreshold = warningDate.toISOString().split('T')[0];

    let expired = 0;
    let expiringSoon = 0;
    let active = 0;

    documents.forEach(doc => {
      if (!doc.expiryDate) {
        active++;
        return;
      }
      if (doc.expiryDate < today) {
        expired++;
      } else if (doc.expiryDate <= warningThreshold) {
        expiringSoon++;
      } else {
        active++;
      }
    });

    return { total: documents.length, expired, expiringSoon, active };
  }, [documents]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(doc => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [documents]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Geral</h1>
        <p className="text-gray-500">Visão geral do status de conformidade da empresa.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Documentos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <FileStack size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Vigentes</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <Link to="/documents?status=expiring" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-yellow-300 transition-colors cursor-pointer group">
          <div>
            <p className="text-sm font-medium text-gray-500 group-hover:text-yellow-700">A Vencer (30 dias)</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.expiringSoon}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
            <Clock size={24} />
          </div>
        </Link>

        <Link to="/documents?status=expired" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-300 transition-colors cursor-pointer group">
          <div>
            <p className="text-sm font-medium text-gray-500 group-hover:text-red-700">Vencidos</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.expired}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <AlertTriangle size={24} />
          </div>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Geral</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Vencidos', value: stats.expired, fill: '#ef4444' },
                  { name: 'A Vencer', value: stats.expiringSoon, fill: '#eab308' },
                  { name: 'Ativos', value: stats.active, fill: '#22c55e' },
                ]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                   {
                    [stats.expired, stats.expiringSoon, stats.active].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#eab308' : '#22c55e'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
