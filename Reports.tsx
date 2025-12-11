import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DocumentCategory, DocumentStatus } from '../types';
import { Printer, FileDown, Filter } from 'lucide-react';
import { format, differenceInCalendarDays, parseISO, isValid } from 'date-fns';

export const Reports: React.FC = () => {
  const { documents, locations, getLocationName } = useStore();
  const [filters, setFilters] = useState({
    category: '',
    locationId: '',
    status: '',
    startDate: '',
    endDate: ''
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

  const reportData = useMemo(() => {
    return documents.filter(doc => {
      const status = getStatus(doc);
      
      const matchCat = filters.category ? doc.category === filters.category : true;
      const matchLoc = filters.locationId ? doc.locationId === filters.locationId : true;
      
      let matchStatus = true;
      if (filters.status === 'expired') matchStatus = status === DocumentStatus.EXPIRED;
      if (filters.status === 'expiring') matchStatus = status === DocumentStatus.EXPIRING;
      if (filters.status === 'active') matchStatus = status === DocumentStatus.ACTIVE;

      let matchDate = true;
      if (filters.startDate && doc.issueDate < filters.startDate) matchDate = false;
      if (filters.endDate && doc.issueDate > filters.endDate) matchDate = false;

      return matchCat && matchLoc && matchStatus && matchDate;
    });
  }, [documents, filters]);

  const handlePrint = () => {
    window.print();
  };

  const getDaysRemainingText = (dateString?: string) => {
    if (!dateString) return null;
    const target = parseISO(dateString);
    if (!isValid(target)) return null;
    const today = new Date();
    const diff = differenceInCalendarDays(target, today);

    if (diff < 0) return `${Math.abs(diff)} dias atrás`;
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return `${diff} dias`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500">Gere relatórios PDF para auditoria e controle.</p>
        </div>
        <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Printer size={18} />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Report Filters - Hidden on Print */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 no-print">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Filter size={18} /> Filtros do Relatório
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
             <select 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                value={filters.category}
                onChange={e => setFilters({...filters, category: e.target.value})}
              >
                <option value="">Todas Categorias</option>
                {Object.values(DocumentCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
             </select>

             <select 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                value={filters.locationId}
                onChange={e => setFilters({...filters, locationId: e.target.value})}
              >
                <option value="">Todos Locais</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
             </select>

             <select 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Todos Status</option>
                <option value="active">Vigentes</option>
                <option value="expiring">A Vencer</option>
                <option value="expired">Vencidos</option>
             </select>

             <input 
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
                placeholder="Data Início"
             />
             <input 
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
                placeholder="Data Fim"
             />
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 print-break-inside min-h-[500px]">
        
        {/* Print Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Docflow</h1>
                <p className="text-sm text-gray-500 mt-1">Relatório de Gestão de Documentos</p>
             </div>
             <div className="text-right">
                <p className="text-sm text-gray-500">Gerado em:</p>
                <p className="font-medium">{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
             </div>
        </div>

        {/* Print Summary */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 print:bg-transparent print:border-none print:p-0">
             <p className="text-sm text-gray-600">
                <strong>Filtros aplicados:</strong> {filters.category || 'Todas categorias'}, {filters.status === 'expired' ? 'Vencidos' : filters.status === 'expiring' ? 'A Vencer' : 'Todos status'}.
             </p>
             <p className="text-sm text-gray-600 mt-1">
                <strong>Total de registros:</strong> {reportData.length}
             </p>
        </div>

        {/* Data Table */}
        <table className="w-full text-left text-sm">
            <thead>
                <tr className="border-b border-gray-300">
                    <th className="py-2 font-bold text-gray-700">Título</th>
                    <th className="py-2 font-bold text-gray-700">Categoria</th>
                    <th className="py-2 font-bold text-gray-700">Local</th>
                    <th className="py-2 font-bold text-gray-700">Emissão</th>
                    <th className="py-2 font-bold text-gray-700">Vencimento</th>
                    <th className="py-2 font-bold text-gray-700">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {reportData.map(doc => {
                    const status = getStatus(doc);
                    return (
                        <tr key={doc.id} className="print-break-inside">
                            <td className="py-3 pr-2 align-top font-medium">{doc.title}</td>
                            <td className="py-3 pr-2 align-top">{doc.category}</td>
                            <td className="py-3 pr-2 align-top">{getLocationName(doc.locationId)}</td>
                            <td className="py-3 pr-2 align-top">{doc.issueDate ? format(new Date(doc.issueDate), 'dd/MM/yyyy') : '-'}</td>
                            <td className="py-3 pr-2 align-top">
                                {doc.expiryDate ? (
                                    <div>
                                        <span>{format(new Date(doc.expiryDate), 'dd/MM/yyyy')}</span>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {getDaysRemainingText(doc.expiryDate)}
                                        </div>
                                    </div>
                                ) : 'N/A'}
                            </td>
                            <td className="py-3 pr-2 align-top">
                                <span className={`
                                    px-2 py-1 rounded text-xs font-bold
                                    ${status === DocumentStatus.EXPIRED ? 'text-red-700 bg-red-100' : ''}
                                    ${status === DocumentStatus.EXPIRING ? 'text-yellow-700 bg-yellow-100' : ''}
                                    ${status === DocumentStatus.ACTIVE ? 'text-green-700 bg-green-100' : ''}
                                    print:bg-transparent print:text-black print:font-normal
                                `}>
                                    {status === DocumentStatus.EXPIRED ? '[VENCIDO]' : ''}
                                    {status === DocumentStatus.EXPIRING ? '[A VENCER]' : ''}
                                    {status === DocumentStatus.ACTIVE ? 'Ativo' : ''}
                                </span>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>

        {reportData.length === 0 && (
             <div className="py-12 text-center text-gray-400">
                 Nenhum dado encontrado para os filtros selecionados.
             </div>
        )}
      </div>
    </div>
  );
};