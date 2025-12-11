import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { DocumentCategory, DocumentItem } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Sparkles, Loader2, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { suggestCategory } from '../services/geminiService';

export const DocumentForm: React.FC = () => {
  const { addDocument, updateDocument, documents, locations } = useStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== 'new';

  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<DocumentItem>>({
    title: '',
    description: '',
    category: DocumentCategory.OPERATIONAL,
    locationId: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    responsible: '',
    code: '',
    observations: '',
    fileName: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        setFormData(doc);
      } else {
        navigate('/documents');
      }
    }
  }, [id, isEdit, documents, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulation only
      setFormData({ ...formData, fileName: e.target.files[0].name });
    }
  };

  const handleAiSuggest = async () => {
    if (!formData.title && !formData.description) {
      alert("Preencha título ou descrição para usar a IA.");
      return;
    }
    setIsAiLoading(true);
    const suggestion = await suggestCategory(formData.title || '', formData.description || '');
    if (suggestion) {
      setFormData(prev => ({ ...prev, category: suggestion }));
    } else {
        alert("Não foi possível sugerir uma categoria.");
    }
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.title || !formData.locationId || !formData.category) {
        alert("Preencha os campos obrigatórios.");
        setIsLoading(false);
        return;
    }

    // Simulate API delay
    setTimeout(() => {
      const docPayload: DocumentItem = {
        id: isEdit ? id! : uuidv4(),
        title: formData.title!,
        description: formData.description || '',
        category: formData.category as DocumentCategory,
        locationId: formData.locationId!,
        issueDate: formData.issueDate!,
        expiryDate: formData.expiryDate || undefined,
        responsible: formData.responsible || 'Admin',
        code: formData.code,
        observations: formData.observations,
        fileName: formData.fileName,
        createdAt: isEdit ? (formData as DocumentItem).createdAt : Date.now(),
      };

      if (isEdit) {
        updateDocument(docPayload);
      } else {
        addDocument(docPayload);
      }
      setIsLoading(false);
      navigate('/documents');
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Documento' : 'Novo Documento'}</h1>
          <button onClick={() => navigate('/documents')} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
       </div>

       <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Básicas</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Título do Documento *</label>
                   <input required name="title" value={formData.title} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Alvará de Funcionamento" />
                </div>
                
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Descrição/Resumo</label>
                   <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Breve descrição do conteúdo..." />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                   <div className="flex gap-2">
                       <select required name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                          {Object.values(DocumentCategory).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                          ))}
                       </select>
                       <button type="button" onClick={handleAiSuggest} disabled={isAiLoading} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1 text-sm font-medium" title="Sugerir Categoria com IA">
                          {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                          <span className="hidden sm:inline">IA</span>
                       </button>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Use a IA para sugerir a categoria baseada no título e descrição.</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Local da Empresa *</label>
                   <select required name="locationId" value={formData.locationId} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="">Selecione um local...</option>
                      {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                   </select>
                </div>
             </div>
          </div>

          {/* Section 2: Dates & Control */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Controle & Datas</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
                   <input required name="issueDate" value={formData.issueDate} onChange={handleChange} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                   <input name="expiryDate" value={formData.expiryDate} onChange={handleChange} type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                   <p className="text-xs text-gray-500 mt-1">Deixe em branco se não houver validade.</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Responsável Interno</label>
                   <input name="responsible" value={formData.responsible} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do colaborador" />
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Número/Código</label>
                   <input name="code" value={formData.code} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
             </div>
          </div>

           {/* Section 3: Attachment & Extras */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Anexos & Observações</h3>
             <div className="grid grid-cols-1 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo do Documento</label>
                   <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors relative">
                      <div className="space-y-1 text-center">
                         <FileText className="mx-auto h-12 w-12 text-gray-400" />
                         <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                               <span>Upload de arquivo</span>
                               <input name="file" type="file" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                         </div>
                         <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                         {formData.fileName && (
                           <p className="text-sm font-semibold text-green-600 mt-2">Selecionado: {formData.fileName}</p>
                         )}
                      </div>
                   </div>
                </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Observações Gerais</label>
                   <textarea name="observations" value={formData.observations} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
             <button type="button" onClick={() => navigate('/documents')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
               Cancelar
             </button>
             <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
               {isLoading && <Loader2 className="animate-spin" size={18} />}
               {isEdit ? 'Salvar Alterações' : 'Cadastrar Documento'}
             </button>
          </div>
       </form>
    </div>
  );
};