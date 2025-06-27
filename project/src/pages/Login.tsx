import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Mail, Lock, Eye, EyeOff, Zap, Users, Target } from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { useToast } from '../components/UI/ToastContainer';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      addToast({
        type: 'success',
        title: 'Login realizado!',
        message: 'Bem-vindo à plataforma JurisConnect.'
      });
      navigate('/dashboard');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no login',
        message: 'Verifique suas credenciais e tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@jurisconnect.com', password: 'admin123', role: 'Administrador da Plataforma' },
    { email: 'cliente@exemplo.com', password: 'cliente123', role: 'Cliente (Escritório)' },
    { email: 'correspondente@exemplo.com', password: 'corresp123', role: 'Correspondente Jurídico' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 text-white">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">JurisConnect</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">
            A Plataforma que Conecta o Direito
          </h2>
          
          <p className="text-xl text-blue-200 mb-8">
            Automatize e otimize seus serviços jurídicos com nossa plataforma inteligente de correspondentes.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-400 mr-3" />
              <span>Rede nacional de correspondentes qualificados</span>
            </div>
            <div className="flex items-center">
              <Target className="h-6 w-6 text-blue-400 mr-3" />
              <span>Atribuição inteligente baseada em localização e especialidade</span>
            </div>
            <div className="flex items-center">
              <Scale className="h-6 w-6 text-blue-400 mr-3" />
              <span>Gestão completa de pagamentos e qualidade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-full">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">JurisConnect</h2>
            <p className="mt-2 text-blue-200">Plataforma de Correspondentes Jurídicos</p>
          </div>

          <Card className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Entrar na Plataforma</h3>
              <p className="text-gray-600 mt-2">Acesse sua conta para continuar</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Contas de demonstração</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
                  >
                    <span className="font-medium">{account.role}</span>
                    <br />
                    <span className="text-xs text-gray-500">{account.email}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                Não tem uma conta?
              </div>
              <div className="mt-2 space-x-4">
                <Link
                  to="/register/client"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Cadastrar Escritório
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/register/correspondent"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Ser Correspondente
                </Link>
              </div>
            </div>
          </Card>

          <div className="text-center text-blue-200 text-sm">
            <p>© 2024 JurisConnect. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;