import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { DocumentStatus } from '../types';
import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft, Edit2, FileText, Calendar, MapPin, 
  User, Tag, AlertCircle, Clock, CheckCircle, Download 
} from 'lucide-react';

export const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documents, getLocationName } = useStore();

  const doc = documents.find(d => d.id === id);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-xl font-semibold">Documento não encontrado</p>
        <button onClick={() => navigate('/documents')} className="mt-4 text-blue-600 hover:underline">
          Voltar para a lista
        </button>
      </div>
    );
  }

  const getStatus = (): DocumentStatus => {
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

  const status = getStatus();
  const statusColor = 
    status === DocumentStatus.EXPIRED ? 'bg-red-100 text-red-700 border-red-200' : 
    status === DocumentStatus.EXPIRING ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
    'bg-green-100 text-green-700 border-green-200';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Inválido';
  };

  const getDaysRemainingText = (dateString?: string) => {
    if (!dateString) return null;
    const target = parseISO(dateString);
    if (!isValid(target)) return null;
    const today = new Date();
    const diff = differenceInCalendarDays(target, today);

    if (diff < 0) return `(Vencido há ${Math.abs(diff)} dias)`;
    if (diff === 0) return '(Vence hoje)';
    if (diff === 1) return '(Vence amanhã)';
    return `(Faltam ${diff} dias)`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/documents')} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
                title="Voltar"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Detalhes do Documento</h1>
                <p className="text-sm text-gray-500">Visualizando informações completas</p>
            </div>
        </div>
        <div className="flex gap-3">
             <Link 
                to={`/documents/${doc.id}`} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
             >
                <Edit2 size={18} />
                Editar
             </Link>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-500" size={20} />
                        Dados Principais
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5 ${statusColor}`}>
                         {status === DocumentStatus.EXPIRED && <AlertCircle size={14} />}
                         {status === DocumentStatus.EXPIRING && <Clock size={14} />}
                         {status === DocumentStatus.ACTIVE && <CheckCircle size={14} />}
                         {status === DocumentStatus.ACTIVE ? 'Vigente' : status === DocumentStatus.EXPIRING ? 'A Vencer' : 'Vencido'}
                    </span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Título</label>
                        <p className="text-lg font-medium text-gray-900">{doc.title}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Descrição</label>
                        <p className="text-gray-700 leading-relaxed">{doc.description || 'Sem descrição.'}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Categoria</label>
                            <div className="flex items-center gap-2 mt-1 text-gray-900">
                                <Tag size={16} className="text-gray-400" />
                                {doc.category}
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Código / Nº</label>
                            <p className="text-gray-900 mt-1">{doc.code || '-'}</p>
                        </div>
                     </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <Download className="text-blue-500" size={20} />
                    Anexos
                </h2>
                {doc.fileName ? (
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-200">
                                <FileText className="text-red-500" size={24} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{doc.fileName}</p>
                                <p className="text-xs text-gray-500">Documento anexado</p>
                            </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                            <Download size={16} /> Baixar
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Nenhum arquivo anexado a este registro.</p>
                )}
            </div>
             {doc.observations && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Observações</h2>
                    <p className="text-gray-700">{doc.observations}</p>
                </div>
            )}
        </div>

        {/* Right Column - Meta Info */}
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Localização & Datas</h2>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <MapPin size={16} />
                            <span className="text-xs font-semibold uppercase">Local</span>
                        </div>
                        <p className="text-gray-900 font-medium pl-6">{getLocationName(doc.locationId)}</p>
                    </div>

                     <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <User size={16} />
                            <span className="text-xs font-semibold uppercase">Responsável</span>
                        </div>
                        <p className="text-gray-900 font-medium pl-6">{doc.responsible || 'Não informado'}</p>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4"></div>

                     <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Calendar size={16} />
                            <span className="text-xs font-semibold uppercase">Data de Emissão</span>
                        </div>
                        <p className="text-gray-900 font-medium pl-6">{formatDate(doc.issueDate)}</p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Calendar size={16} />
                            <span className="text-xs font-semibold uppercase">Data de Vencimento</span>
                        </div>
                        <div className="pl-6">
                            <p className={`font-medium ${status === DocumentStatus.ACTIVE ? 'text-gray-900' : status === DocumentStatus.EXPIRING ? 'text-yellow-600' : 'text-red-600'}`}>
                                {formatDate(doc.expiryDate)}
                            </p>
                            {doc.expiryDate && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {getDaysRemainingText(doc.expiryDate)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};