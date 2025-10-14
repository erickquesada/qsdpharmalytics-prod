import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LayoutDashboard, Plus } from 'lucide-react';

const Setores = () => {
  const setores = [
    { id: 1, nome: 'Norte', cor: 'bg-blue-500' },
    { id: 2, nome: 'Sul', cor: 'bg-green-500' },
    { id: 3, nome: 'Leste', cor: 'bg-yellow-500' },
    { id: 4, nome: 'Oeste', cor: 'bg-red-500' },
    { id: 5, nome: 'Centro', cor: 'bg-purple-500' }
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Setores</h1>
            <p className="text-gray-600 mt-2">Gerenciar setores geográficos</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Setor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {setores.map((setor) => (
            <Card key={setor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${setor.cor}`}></div>
                  {setor.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vendas</span>
                    <Badge>0</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Farmácias</span>
                    <Badge>0</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Médicos</span>
                    <Badge>0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Setores;
