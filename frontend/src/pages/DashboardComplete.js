import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, Calendar, Target,
  BarChart3, PieChart as PieChartIcon, Activity, RefreshCcw
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DashboardComplete = () => {
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [cotas, setCotas] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  const [escopoVendas, setEscopoVendas] = useState('todas');

  useEffect(() => {
    carregarDados();
  }, [escopoVendas]);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [vendasRes, medicamentosRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/sales`),
        axios.get(`${API_URL}/api/v1/products`)
      ]);

      setVendas(vendasRes.data || []);
      setMedicamentos(medicamentosRes.data || []);
      setCotas([]); // Cotas virá depois
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const calcularResumoVendas = () => {
    const agora = new Date();
    const inicioMesAtual = startOfMonth(agora);
    const fimMesAtual = endOfMonth(agora);
    const inicioMesAnterior = startOfMonth(subMonths(agora, 1));
    const fimMesAnterior = endOfMonth(subMonths(agora, 1));

    const vendasMesAtual = vendas.filter(v => {
      const dataVenda = new Date(v.sale_date || v.created_at);
      return dataVenda >= inicioMesAtual && dataVenda <= fimMesAtual;
    });

    const vendasMesAnterior = vendas.filter(v => {
      const dataVenda = new Date(v.sale_date || v.created_at);
      return dataVenda >= inicioMesAnterior && dataVenda <= fimMesAnterior;
    });

    const quantidadeMesAtual = vendasMesAtual.reduce((acc, v) => acc + (v.quantity || 0), 0);
    const quantidadeMesAnterior = vendasMesAnterior.reduce((acc, v) => acc + (v.quantity || 0), 0);

    const crescimento = quantidadeMesAnterior > 0
      ? ((quantidadeMesAtual - quantidadeMesAnterior) / quantidadeMesAnterior) * 100
      : 0;

    const totalUnidades = vendas.reduce((acc, v) => acc + (v.quantity || 0), 0);
    const medicamentosAtivos = medicamentos.filter(m => m.is_active).length;
    const cotasAtivas = cotas.filter(c => {
      const periodoCota = new Date(c.periodo);
      return periodoCota >= inicioMesAtual && periodoCota <= fimMesAtual;
    }).length;

    return {
      vendasMesAtual: quantidadeMesAtual,
      crescimento: crescimento.toFixed(1),
      totalUnidades,
      medicamentosAtivos,
      totalMedicamentos: medicamentos.length,
      cotasAtivas
    };
  };

  const gerarDadosEvolucaoVendas = () => {
    if (periodoSelecionado === 'mes') {
      // Últimos 6 meses
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const data = subMonths(new Date(), i);
        const inicio = startOfMonth(data);
        const fim = endOfMonth(data);

        const vendasPeriodo = vendas.filter(v => {
          const dataVenda = new Date(v.sale_date || v.created_at);
          return dataVenda >= inicio && dataVenda <= fim;
        });

        const quantidade = vendasPeriodo.reduce((acc, v) => acc + (v.quantity || 0), 0);

        meses.push({
          periodo: format(data, 'MMM/yy', { locale: ptBR }),
          quantidade
        });
      }
      return meses;
    } else {
      // Últimos 30 dias
      const dias = [];
      for (let i = 29; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const inicio = startOfDay(data);
        const fim = endOfDay(data);

        const vendasPeriodo = vendas.filter(v => {
          const dataVenda = new Date(v.sale_date || v.created_at);
          return dataVenda >= inicio && dataVenda <= fim;
        });

        const quantidade = vendasPeriodo.reduce((acc, v) => acc + (v.quantity || 0), 0);

        dias.push({
          periodo: format(data, 'dd/MM', { locale: ptBR }),
          quantidade
        });
      }
      return dias;
    }
  };

  const gerarTopMedicamentos = () => {
    const vendasPorMedicamento = {};

    vendas.forEach(venda => {
      const prodId = venda.product_id;
      if (!vendasPorMedicamento[prodId]) {
        vendasPorMedicamento[prodId] = {
          nome: venda.product_name || 'Desconhecido',
          quantidade: 0
        };
      }
      vendasPorMedicamento[prodId].quantidade += venda.quantity || 0;
    });

    return Object.values(vendasPorMedicamento)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 6);
  };

  const gerarDadosSazonalidade = () => {
    const estacoes = {
      'Verão': { quantidade: 0 },
      'Outono': { quantidade: 0 },
      'Inverno': { quantidade: 0 },
      'Primavera': { quantidade: 0 }
    };

    vendas.forEach(venda => {
      const mes = new Date(venda.sale_date || venda.created_at).getMonth() + 1;
      let estacao;
      if (mes === 12 || mes <= 2) estacao = 'Verão';
      else if (mes >= 3 && mes <= 5) estacao = 'Outono';
      else if (mes >= 6 && mes <= 8) estacao = 'Inverno';
      else estacao = 'Primavera';

      estacoes[estacao].quantidade += venda.quantity || 0;
    });

    return Object.entries(estacoes).map(([name, data]) => ({
      name,
      quantidade: data.quantidade
    }));
  };

  const gerarDadosMensais = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosMensais = meses.map(mes => ({ name: mes, quantidade: 0 }));

    vendas.forEach(venda => {
      const mesIndex = new Date(venda.sale_date || venda.created_at).getMonth();
      dadosMensais[mesIndex].quantidade += venda.quantity || 0;
    });

    return dadosMensais;
  };

  const resumo = calcularResumoVendas();
  const dadosEvolucao = gerarDadosEvolucaoVendas();
  const topMedicamentos = gerarTopMedicamentos();
  const dadosSazonalidade = gerarDadosSazonalidade();
  const dadosMensais = gerarDadosMensais();

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Farmacêutico</h1>
            <p className="text-gray-600 mt-2">Análise completa de vendas e performance</p>
          </div>
          <div className="flex gap-3 items-center">
            {user?.role === 'admin' && (
              <Select value={escopoVendas} onValueChange={setEscopoVendas}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Vendas</SelectItem>
                  <SelectItem value="minhas">Minhas Vendas</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Por Mês</SelectItem>
                <SelectItem value="dia">Por Dia</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={carregarDados}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendas Este Mês</p>
                  <p className="text-2xl font-bold mt-2">{resumo.vendasMesAtual}</p>
                  <div className="flex items-center mt-2 text-sm">
                    {parseFloat(resumo.crescimento) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={parseFloat(resumo.crescimento) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {resumo.crescimento}%
                    </span>
                    <span className="text-gray-600 ml-1">vs mês anterior</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Unidades</p>
                  <p className="text-2xl font-bold mt-2">{resumo.totalUnidades}</p>
                  <p className="text-sm text-gray-600 mt-2">unidades vendidas no total</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Medicamentos Ativos</p>
                  <p className="text-2xl font-bold mt-2">{resumo.medicamentosAtivos}</p>
                  <p className="text-sm text-gray-600 mt-2">de {resumo.totalMedicamentos} cadastrados</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cotas Ativas</p>
                  <p className="text-2xl font-bold mt-2">{resumo.cotasAtivas}</p>
                  <p className="text-sm text-gray-600 mt-2">para este período</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Gráficos */}
        <Tabs defaultValue="vendas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendas">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="produtos">
              <Package className="w-4 h-4 mr-2" />
              Top Produtos
            </TabsTrigger>
            <TabsTrigger value="sazonalidade">
              <Activity className="w-4 h-4 mr-2" />
              Sazonalidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendas">
            <Card>
              <CardHeader>
                <CardTitle>Evolução das Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dadosEvolucao}>
                    <defs>
                      <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="quantidade" stroke="#3b82f6" fillOpacity={1} fill="url(#colorQuantidade)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos">
            <Card>
              <CardHeader>
                <CardTitle>Top Medicamentos por Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topMedicamentos} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nome" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sazonalidade">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Estação do Ano</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosSazonalidade}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Mês (Total)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosMensais}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardComplete;
