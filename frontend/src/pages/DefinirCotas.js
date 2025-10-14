import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DefinirCotas = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [formData, setFormData] = useState({
    medicamento_id: '',
    periodo: format(new Date(), 'yyyy-MM'),
    quantidade: 0
  });

  useEffect(() => {
    fetchMedicamentos();
  }, []);

  const fetchMedicamentos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/products?is_active=true`);
      setMedicamentos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert('Funcionalidade de cotas será implementada em breve!');
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Definir Cotas</h1>
          <p className="text-gray-600 mt-2">Estabeleça metas de vendas por medicamento e período</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Nova Cota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período (Mês/Ano) *</Label>
                  <Input
                    id="periodo"
                    type="month"
                    value={formData.periodo}
                    onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicamento_id">Medicamento *</Label>
                  <Select 
                    value={formData.medicamento_id} 
                    onValueChange={(value) => setFormData({...formData, medicamento_id: value})}
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="quantidade">Quantidade (Meta) *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Definir Cota
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Cotas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma cota cadastrada ainda</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DefinirCotas;
