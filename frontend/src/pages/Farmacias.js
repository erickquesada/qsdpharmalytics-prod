import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Edit, Trash2, Store, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Farmacias = () => {
  const [farmacias, setFarmacias] = useState([]);
  const [filteredFarmacias, setFilteredFarmacias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFarmacia, setEditingFarmacia] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchFarmacias();
  }, []);

  useEffect(() => {
    filterFarmacias();
  }, [searchTerm, farmacias]);

  const fetchFarmacias = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/pharmacies`);
      setFarmacias(response.data || []);
      setFilteredFarmacias(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar farmácias:', error);
      setFarmacias([]);
      setFilteredFarmacias([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFarmacias = () => {
    if (!searchTerm) {
      setFilteredFarmacias(farmacias);
      return;
    }
    const filtered = farmacias.filter(f =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFarmacias(filtered);
  };

  const handleEdit = (farmacia) => {
    setEditingFarmacia(farmacia);
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta farmácia?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/pharmacies/${id}`);
      fetchFarmacias();
    } catch (error) {
      console.error('Erro ao excluir farmácia:', error);
      alert('Erro ao excluir farmácia');
    }
  };

  const handleSave = async () => {
    setSalvando(true);
    try {
      const dataToSave = {
        name: editingFarmacia.name,
        address: editingFarmacia.address || '',
        city: editingFarmacia.city || '',
        state: editingFarmacia.state || '',
        phone: editingFarmacia.phone || '',
        email: editingFarmacia.email || ''
      };

      if (editingFarmacia.id) {
        await axios.put(`${API_URL}/api/v1/pharmacies/${editingFarmacia.id}`, dataToSave);
      } else {
        await axios.post(`${API_URL}/api/v1/pharmacies`, dataToSave);
      }
      setShowEditDialog(false);
      setEditingFarmacia(null);
      fetchFarmacias();
    } catch (error) {
      console.error('Erro ao salvar farmácia:', error);
      alert('Erro ao salvar farmácia');
    } finally {
      setSalvando(false);
    }
  };

  const handleAddNew = () => {
    setEditingFarmacia({
      name: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: ''
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
            <h1 className="text-3xl font-bold text-gray-900">Farmácias</h1>
            <p className="text-gray-600 mt-2">Gerenciar cadastro de farmácias</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Farmácia
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar farmácia..."
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
                  <p className="text-sm font-medium text-gray-600">Total de Farmácias</p>
                  <p className="text-2xl font-bold mt-2">{farmacias.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Farmácias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFarmacias.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma farmácia cadastrada</p>
                  <Button onClick={handleAddNew} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeira Farmácia
                  </Button>
                </div>
              ) : (
                filteredFarmacias.map((farmacia) => (
                  <div
                    key={farmacia.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{farmacia.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {farmacia.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {farmacia.address}, {farmacia.city} - {farmacia.state}
                          </span>
                        )}
                      </div>
                      {farmacia.phone && (
                        <p className="text-sm text-gray-500 mt-1">Tel: {farmacia.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(farmacia)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(farmacia.id)}
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

      {showEditDialog && editingFarmacia && (
        <Dialog open={true} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {editingFarmacia.id ? 'Editar Farmácia' : 'Nova Farmácia'}
              </DialogTitle>
              <DialogDescription>
                {editingFarmacia.id ? 'Atualize as informações da farmácia.' : 'Cadastre uma nova farmácia no sistema.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nome da Farmácia *</Label>
                  <Input
                    id="name"
                    value={editingFarmacia.name || ''}
                    onChange={(e) => setEditingFarmacia({...editingFarmacia, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={editingFarmacia.address || ''}
                    onChange={(e) => setEditingFarmacia({...editingFarmacia, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={editingFarmacia.city || ''}
                    onChange={(e) => setEditingFarmacia({...editingFarmacia, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={editingFarmacia.state || ''}
                    onChange={(e) => setEditingFarmacia({...editingFarmacia, state: e.target.value})}
                    placeholder="Ex: SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={editingFarmacia.phone || ''}
                    onChange={(e) => setEditingFarmacia({...editingFarmacia, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingFarmacia.email || ''}
                    onChange={(e) => setEditingFarmacia({...editingFarmacia, email: e.target.value})}
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
                    {editingFarmacia.id ? 'Salvar Alterações' : 'Criar Farmácia'}
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

export default Farmacias;
