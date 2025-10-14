import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const NovaVenda = () => {
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    sale_date: new Date().toISOString().split('T')[0],
    customer_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchMedicamentos();
  }, []);

  const fetchMedicamentos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products?is_active=true`);
      setMedicamentos(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    
    try {
      const medicamentoSelecionado = medicamentos.find(m => m.id === formData.product_id);
      
      const dataToSave = {
        product_id: formData.product_id,
        product_name: medicamentoSelecionado?.name || '',
        quantity: parseFloat(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
        sale_date: formData.sale_date,
        customer_name: formData.customer_name,
        notes: formData.notes
      };

      await axios.post(`${API_URL}/api/v1/sales`, dataToSave);
      
      alert('Venda registrada com sucesso!');
      // Resetar formulário
      setFormData({
        product_id: '',
        quantity: 1,
        unit_price: 0,
        sale_date: new Date().toISOString().split('T')[0],
        customer_name: '',
        notes: ''
      });
      
      // Opcionalmente redirecionar para histórico
      // navigate('/historico-vendas');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao registrar venda');
    } finally {
      setSalvando(false);
    }
  };

  const calcularTotal = () => {
    return (parseFloat(formData.quantity) * parseFloat(formData.unit_price || 0)).toFixed(2);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Venda</h1>
          <p className="text-gray-600 mt-2">Registre uma nova venda no sistema</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sale_date">Data da Venda *</Label>
                  <Input
                    id="sale_date"
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) => handleInputChange('sale_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_id">Medicamento *</Label>
                  <Select 
                    value={formData.product_id} 
                    onValueChange={(value) => {
                      handleInputChange('product_id', value);
                      const med = medicamentos.find(m => m.id === value);
                      if (med) {
                        handleInputChange('unit_price', med.unit_price || 0);
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um medicamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicamentos.map(med => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_price">Preço Unitário *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleInputChange('unit_price', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customer_name">Cliente</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Observações adicionais sobre a venda..."
                />
              </div>

              {formData.product_id && formData.quantity > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total da Venda:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {calcularTotal()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/historico-vendas')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={salvando || !formData.product_id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {salvando ? 'Salvando...' : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Registrar Venda
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default NovaVenda;
