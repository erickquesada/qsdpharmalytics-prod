import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [filteredMedicos, setFilteredMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedico, setEditingMedico] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchMedicos();
  }, []);

  useEffect(() => {
    filterMedicos();
  }, [searchTerm, medicos]);

  const fetchMedicos = async () => {
    try {
      // Como não temos endpoint de médicos no backend, vamos simular
      // Em produção, substituir por: await axios.get(`${API_URL}/api/v1/doctors`);
      setMedicos([]);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedicos = () => {
    if (!searchTerm) {
      setFilteredMedicos(medicos);
      return;
    }
    const filtered = medicos.filter(med =>
      med.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.crm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.especialidade?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedicos(filtered);
  };

  const handleEdit = (medico) => {
    setEditingMedico(medico);
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este médico?')) return;
    try {
      // await axios.delete(`${API_URL}/api/v1/doctors/${id}`);
      fetchMedicos();
    } catch (error) {
      console.error('Erro ao excluir médico:', error);
      alert('Erro ao excluir médico');
    }
  };

  const handleSave = async () => {
    setSalvando(true);
    try {
      if (editingMedico.id) {
        // await axios.put(`${API_URL}/api/v1/doctors/${editingMedico.id}`, editingMedico);
      } else {
        // await axios.post(`${API_URL}/api/v1/doctors`, editingMedico);
      }
      setShowEditDialog(false);
      setEditingMedico(null);
      fetchMedicos();
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
      alert('Erro ao salvar médico');
    } finally {
      setSalvando(false);
    }
  };

  const handleAddNew = () => {
    setEditingMedico({
      nome: '',
      crm: '',
      especialidade: '',
      telefone: '',
      email: '',
      endereco: ''
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Médicos</h1>
            <p className="text-gray-600 mt-2">Gerenciar cadastro de médicos</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Médico
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Médicos</p>
                  <p className="text-2xl font-bold mt-2">{medicos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMedicos.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum médico cadastrado</p>
                  <Button onClick={handleAddNew} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Médico
                  </Button>
                </div>
              ) : (
                filteredMedicos.map((medico) => (
                  <div
                    key={medico.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{medico.nome}</h3>
                        <Badge>{medico.crm}</Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Especialidade: {medico.especialidade}</span>
                        {medico.telefone && <span>Tel: {medico.telefone}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(medico)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(medico.id)}
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

      {showEditDialog && editingMedico && (
        <Dialog open={true} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {editingMedico.id ? 'Editar Médico' : 'Novo Médico'}
              </DialogTitle>
              <DialogDescription>
                {editingMedico.id ? 'Atualize as informações do médico.' : 'Cadastre um novo médico no sistema.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={editingMedico.nome || ''}
                    onChange={(e) => setEditingMedico({...editingMedico, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM *</Label>
                  <Input
                    id="crm"
                    value={editingMedico.crm || ''}
                    onChange={(e) => setEditingMedico({...editingMedico, crm: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input
                    id="especialidade"
                    value={editingMedico.especialidade || ''}
                    onChange={(e) => setEditingMedico({...editingMedico, especialidade: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={editingMedico.telefone || ''}
                    onChange={(e) => setEditingMedico({...editingMedico, telefone: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingMedico.email || ''}
                    onChange={(e) => setEditingMedico({...editingMedico, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={editingMedico.endereco || ''}
                    onChange={(e) => setEditingMedico({...editingMedico, endereco: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={salvando} className="bg-blue-600 hover:bg-blue-700">
                {salvando ? 'Salvando...' : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {editingMedico.id ? 'Salvar Alterações' : 'Criar Médico'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Medicos;
