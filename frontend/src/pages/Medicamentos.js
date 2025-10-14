import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import EditMedicamentoDialog from '../components/medicamentos/EditMedicamentoDialog';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Medicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicamento, setEditingMedicamento] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchMedicamentos();
  }, []);

  useEffect(() => {
    filterMedicamentos();
  }, [searchTerm, medicamentos]);

  const fetchMedicamentos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products`);
      setMedicamentos(response.data || []);
      setFilteredMedicamentos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedicamentos = () => {
    if (!searchTerm) {
      setFilteredMedicamentos(medicamentos);
      return;
    }
    const filtered = medicamentos.filter(med =>
      med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedicamentos(filtered);
  };

  const handleEdit = (medicamento) => {
    setEditingMedicamento(medicamento);
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este medicamento?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/v1/products/${id}`);
      fetchMedicamentos();
    } catch (error) {
      console.error('Erro ao excluir medicamento:', error);
      alert('Erro ao excluir medicamento');
    }
  };

  const handleSaveSuccess = () => {
    setShowEditDialog(false);
    setEditingMedicamento(null);
    fetchMedicamentos();
  };

  const handleAddNew = () => {
    setEditingMedicamento({
      name: '',
      description: '',
      unit_price: 0,
      stock_quantity: 0,
      category: '',
      manufacturer: '',
      is_active: true
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medicamentos</h1>
            <p className="text-gray-600 mt-2">Gerenciar catálogo de medicamentos</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Medicamento
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Medicamentos</p>
                  <p className="text-2xl font-bold mt-2">{medicamentos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold mt-2">
                    {medicamentos.filter(m => m.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold mt-2">
                    {medicamentos.filter(m => !m.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Medicamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMedicamentos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum medicamento encontrado</p>
              ) : (
                filteredMedicamentos.map((medicamento) => (
                  <div
                    key={medicamento.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{medicamento.name}</h3>
                        <Badge variant={medicamento.is_active ? 'default' : 'secondary'}>
                          {medicamento.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{medicamento.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Fabricante: {medicamento.manufacturer || 'N/A'}</span>
                        <span>Categoria: {medicamento.category || 'N/A'}</span>
                        <span>Estoque: {medicamento.stock_quantity || 0}</span>
                        <span className="font-semibold text-green-600">
                          R$ {(medicamento.unit_price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(medicamento)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(medicamento.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && editingMedicamento && (
        <EditMedicamentoDialog
          medicamento={editingMedicamento}
          onOpenChange={setShowEditDialog}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default Medicamentos;
