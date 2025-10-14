import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Edit, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EditVendaDialog = ({ venda, onOpenChange, onSaveSuccess }) => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    ...venda,
    sale_date: format(new Date(venda.sale_date || venda.created_at), 'yyyy-MM-dd')
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

  const handleSave = async () => {
    setSalvando(true);
    try {
      const medicamentoSelecionado = medicamentos.find(m => m.id === formData.product_id);
      
      const dataToSave = {
        product_id: formData.product_id,
        product_name: medicamentoSelecionado?.name || formData.product_name,
        quantity: parseFloat(formData.quantity),
        unit_price: parseFloat(formData.unit_price || 0),
        sale_date: formData.sale_date,
        customer_name: formData.customer_name || '',
        notes: formData.notes || ''
      };

      if (venda.id) {
        await axios.put(`${API_URL}/api/v1/sales/${venda.id}`, dataToSave);
      } else {
        await axios.post(`${API_URL}/api/v1/sales`, dataToSave);
      }
      
      onSaveSuccess();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            {venda.id ? 'Editar Venda' : 'Nova Venda'}
          </DialogTitle>
          <DialogDescription>
            {venda.id ? 'Atualize as informações do registro de venda.' : 'Registre uma nova venda no sistema.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sale_date">Data</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => handleInputChange('sale_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_id">Medicamento</Label>
              <Select value={formData.product_id} onValueChange={(value) => handleInputChange('product_id', value)}>
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
              <Label htmlFor="quantity">Quantidade de Unidades</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Preço Unitário</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price || 0}
                onChange={(e) => handleInputChange('unit_price', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer_name">Cliente</Label>
              <Input
                id="customer_name"
                value={formData.customer_name || ''}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={salvando} className="bg-blue-600 hover:bg-blue-700">
            {salvando ? 'Salvando...' : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {venda.id ? 'Salvar Alterações' : 'Criar Venda'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVendaDialog;
