import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, Edit, Trash2, Calendar, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditVendaDialog from '../components/vendas/EditVendaDialog';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const HistoricoVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [filteredVendas, setFilteredVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVenda, setEditingVenda] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchVendas();
  }, []);

  useEffect(() => {
    filterVendas();
  }, [searchTerm, vendas]);

  const fetchVendas = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/sales`);
      const vendasOrdenadas = (response.data || []).sort((a, b) => 
        new Date(b.sale_date || b.created_at) - new Date(a.sale_date || a.created_at)
      );
      setVendas(vendasOrdenadas);
      setFilteredVendas(vendasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVendas = () => {
    if (!searchTerm) {
      setFilteredVendas(vendas);
      return;
    }
    const filtered = vendas.filter(venda =>
      venda.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVendas(filtered);
  };

  const handleEdit = (venda) => {
    setEditingVenda(venda);
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/v1/sales/${id}`);
      fetchVendas();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      alert('Erro ao excluir venda');
    }
  };

  const handleSaveSuccess = () => {
    setShowEditDialog(false);
    setEditingVenda(null);
    fetchVendas();
  };

  const calcularResumo = () => {
    const totalVendas = vendas.length;
    const totalUnidades = vendas.reduce((acc, v) => acc + (v.quantity || 0), 0);
    const totalReceita = vendas.reduce((acc, v) => 
      acc + ((v.quantity || 0) * (v.unit_price || 0)), 0
    );

    return { totalVendas, totalUnidades, totalReceita };
  };

  const resumo = calcularResumo();

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Vendas</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie todas as vendas registradas</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold mt-2">{resumo.totalVendas}</p>
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
                  <p className="text-sm font-medium text-gray-600">Unidades Vendidas</p>
                  <p className="text-2xl font-bold mt-2">{resumo.totalUnidades}</p>
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
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold mt-2">
                    R$ {resumo.totalReceita.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por produto, cliente ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredVendas.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma venda encontrada</p>
              ) : (
                filteredVendas.map((venda) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{venda.product_name}</h3>
                        <Badge variant="default">
                          {venda.quantity} unidades
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(venda.sale_date || venda.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        {venda.customer_name && (
                          <span>Cliente: {venda.customer_name}</span>
                        )}
                        <span className="font-semibold text-green-600">
                          R$ {((venda.quantity || 0) * (venda.unit_price || 0)).toFixed(2)}
                        </span>
                      </div>
                      {venda.notes && (
                        <p className="text-sm text-gray-500 mt-1">{venda.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(venda)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(venda.id)}
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
      {showEditDialog && editingVenda && (
        <EditVendaDialog
          venda={editingVenda}
          onOpenChange={setShowEditDialog}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default HistoricoVendas;
