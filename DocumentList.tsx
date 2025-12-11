import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DocumentCategory, DocumentStatus } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { Edit2, Trash2, Plus, Search, FileText, AlertCircle, Filter, Clock, Eye } from 'lucide-react';
import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DocumentList: React.FC = () => {
  const { documents, locations, deleteDocument, getLocationName } = useStore();
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: '',
    locationId: '',
    status: searchParams.get('status') || '',
    search: ''
  });

  const getStatus = (doc: any): DocumentStatus => {
    if (!doc.expiryDate) return DocumentStatus.ACTIVE;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + 30);
    const warningThreshold = warningDate.toISOString().split('T')[0];

    if (doc.expiryDate < today) return DocumentStatus.EXPIRED;
    if (doc.expiryDate <= warningThreshold) return DocumentStatus.EXPIRING;
    return DocumentStatus.ACTIVE;
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const status = getStatus(doc);
      const matchesCategory = filters.category ? doc.category === filters.category : true;
      const matchesLocation = filters.locationId ? doc.locationId === filters.locationId : true;
      const matchesSearch = filters.search 
        ? doc.title.toLowerCase().includes(filters.search.toLowerCase()) || 
          doc.code?.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      
      let matchesStatus = true;
      if (filters.status === 'expired') matchesStatus = status === DocumentStatus.EXPIRED;
      if (filters.status === 'expiring') matchesStatus = status === DocumentStatus.EXPIRING;
      if (filters.status === 'active') matchesStatus = status === DocumentStatus.ACTIVE;

      return matchesCategory && matchesLocation && matchesSearch && matchesStatus;
    });
  }, [documents, filters]);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      deleteDocument(id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Inválido';
  };

  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    const target = parseISO(dateString);
    if (!isValid(target)) return null;
    const today = new Date();
    const diff = differenceInCalendarDays(target, today);

    if (diff < 0) return <span className="text-red-600 text-xs font-medium block mt-0.5">Vencido há {Math.abs(diff)} dias</span>;
    if (diff === 0) return <span className="text-yellow-600 text-xs font-medium block mt-0.5">Vence hoje</span>;
    if (diff === 1) return <span className="text-yellow-600 text-xs font-medium block mt-0.5">Vence amanhã</span>;
    if (diff <= 30) return <span className="text-yellow-600 text-xs font-medium block mt-0.5">Vence em {diff} dias</span>;
    if (diff <= 120) return <span className="text-blue-600 text-xs block mt-0.5">Vence em {diff} dias</span>;
    return <span className="text-gray-400 text-xs block mt-0.5">Faltam {diff} dias</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-500">Gerencie todos os documentos corporativos.</p>
        </div>
        <Link to="/documents/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} />
          Novo Documento
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título ou código..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            value={filters.category}
            onChange={e => setFilters({...filters, category: e.target.value})}
          >
            <option value="">Todas Categorias</option>
            {Object.values(DocumentCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            value={filters.locationId}
            onChange={e => setFilters({...filters, locationId: e.target.value})}
          >
            <option value="">Todos Locais</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
           <select 
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Todos Status</option>
            <option value="active">Ativos</option>
            <option value="expiring">A Vencer (30/60/90/120 dias)</option>
            <option value="expired">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Local</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length > 0 ? filteredDocs.map(doc => {
                const status = getStatus(doc);
                const statusColor = 
                  status === DocumentStatus.EXPIRED ? 'bg-red-100 text-red-700' : 
                  status === DocumentStatus.EXPIRING ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-green-100 text-green-700';
                
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-gray-400"><FileText size={18} /></div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{doc.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doc.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getLocationName(doc.locationId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        {doc.expiryDate ? formatDate(doc.expiryDate) : 'N/A'}
                        {getDaysRemaining(doc.expiryDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                         {status === DocumentStatus.EXPIRED && <AlertCircle size={12} className="mr-1" />}
                         {status === DocumentStatus.EXPIRING && <Clock size={12} className="mr-1" />}
                         {status === DocumentStatus.ACTIVE && 'Ativo'}
                         {status === DocumentStatus.EXPIRING && 'A Vencer'}
                         {status === DocumentStatus.EXPIRED && 'Vencido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/documents/view/${doc.id}`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Visualizar">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/documents/${doc.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit2 size={18} />
                        </Link>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum documento encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};