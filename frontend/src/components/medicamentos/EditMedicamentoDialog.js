import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Edit, CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EditMedicamentoDialog = ({ medicamento, onOpenChange, onSaveSuccess }) => {
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState(medicamento);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSalvando(true);
    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description || '',
        unit_price: parseFloat(formData.unit_price || 0),
        stock_quantity: parseInt(formData.stock_quantity || 0),
        category: formData.category || '',
        manufacturer: formData.manufacturer || '',
        is_active: formData.is_active !== false
      };

      if (medicamento.id) {
        await axios.put(`${API_URL}/api/v1/products/${medicamento.id}`, dataToSave);
      } else {
        await axios.post(`${API_URL}/api/v1/products`, dataToSave);
      }
      
      onSaveSuccess();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      alert('Erro ao salvar medicamento');
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
            {medicamento.id ? 'Editar Medicamento' : 'Novo Medicamento'}
          </DialogTitle>
          <DialogDescription>
            {medicamento.id ? 'Atualize as informações do medicamento.' : 'Cadastre um novo medicamento no sistema.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome do Medicamento *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Paracetamol 500mg"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Descrição do medicamento..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Nome do fabricante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Categoria do medicamento"
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

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Estoque</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                step="1"
                value={formData.stock_quantity || 0}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select 
                value={formData.is_active ? 'true' : 'false'} 
                onValueChange={(value) => handleInputChange('is_active', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                {medicamento.id ? 'Salvar Alterações' : 'Criar Medicamento'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicamentoDialog;
