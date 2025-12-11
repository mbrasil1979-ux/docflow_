import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Location } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MapPin, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

export const Locations: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useStore();
  const [newLoc, setNewLoc] = useState({ name: '', address: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoc.name) {
      if (editingId) {
        updateLocation({
            id: editingId,
            name: newLoc.name,
            address: newLoc.address
        });
        setEditingId(null);
      } else {
        addLocation({
            id: uuidv4(),
            name: newLoc.name,
            address: newLoc.address
        });
      }
      setNewLoc({ name: '', address: '' });
    }
  };

  const handleEdit = (loc: Location) => {
      setEditingId(loc.id);
      setNewLoc({ name: loc.name, address: loc.address || '' });
  };

  const handleCancel = () => {
      setEditingId(null);
      setNewLoc({ name: '', address: '' });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Locais da Empresa</h1>
        <p className="text-gray-500">Cadastre suas filiais ou unidades operacionais.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 sticky top-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{editingId ? 'Editar Local' : 'Novo Local'}</h3>
                {editingId && (
                    <button type="button" onClick={handleCancel} className="text-xs text-gray-500 hover:text-gray-700 underline">
                        Cancelar
                    </button>
                )}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome da Unidade *</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Filial Curitiba"
                value={newLoc.name}
                onChange={e => setNewLoc({...newLoc, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Endereço Completo</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Rua, Número, Bairro..."
                rows={3}
                value={newLoc.address}
                onChange={e => setNewLoc({...newLoc, address: e.target.value})}
              />
            </div>
            <button type="submit" className={`w-full flex items-center justify-center gap-2 text-white py-2 rounded-lg font-medium transition-colors ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {editingId ? 'Salvar Alterações' : 'Adicionar Local'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {locations.map(loc => (
            <div key={loc.id} className={`bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center group transition-colors ${editingId === loc.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${editingId === loc.id ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{loc.name}</h4>
                  {loc.address && <p className="text-sm text-gray-500">{loc.address}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                    onClick={() => handleEdit(loc)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                    disabled={editingId === loc.id}
                >
                    <Edit2 size={18} />
                </button>
                <button 
                    onClick={() => {
                        if(window.confirm('Excluir este local pode afetar documentos associados. Continuar?')) {
                            deleteLocation(loc.id);
                            if (editingId === loc.id) handleCancel();
                        }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {locations.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
               <p className="text-gray-500">Nenhum local cadastrado.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};