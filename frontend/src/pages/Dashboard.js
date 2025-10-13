import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Store, 
  ArrowUp, 
  ArrowDown,
  Package,
  Users
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/analytics/dashboard-summary`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value || 0);
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: dashboardData?.total_revenue || '0',
      change: dashboardData?.revenue_growth || '0',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: dashboardData?.total_orders || 0,
      change: dashboardData?.orders_growth || '0',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Pharmacies',
      value: dashboardData?.active_pharmacies || 0,
      change: '0',
      icon: Store,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Products',
      value: dashboardData?.top_products?.length || 0,
      change: '0',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your pharmacy analytics today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const changeValue = parseFloat(stat.change);
          const isPositive = changeValue >= 0;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">
                      {stat.title.includes('Revenue') 
                        ? formatCurrency(stat.value)
                        : stat.value.toLocaleString()
                      }
                    </p>
                    {changeValue !== 0 && (
                      <div className="flex items-center mt-2 text-sm">
                        {isPositive ? (
                          <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(stat.change)}
                        </span>
                        <span className="text-gray-600 ml-1">vs last period</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Sales */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions in your system</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recent_sales?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_sales.slice(0, 5).map((sale, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">Sale #{sale.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(sale.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(sale.amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                        sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent sales</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products this period</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.top_products?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.top_products.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} sales</p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No product data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dashboardData.alerts.map((alert, index) => (
                <li key={index} className="flex items-start space-x-2 text-orange-800">
                  <span className="mt-1">•</span>
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
