import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { ArrowLeft } from 'lucide-react';
import carroImage from '../../assets/carro.jpg';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Por favor, informe seu email');
      setLoading(false);
      return;
    }

    try {
      await apiWrapper('/auth/forgot-password', {
        method: 'POST',
        data: { email },
      });

      setSuccess(
        'Enviamos um link de recuperação para seu email. Por favor, verifique sua caixa de entrada e siga as instruções para redefinir sua senha.'
      );
      setEmail('');
    } catch (err) {
      const handledError = handleError(err);
      setError(handledError.message || 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Painel Esquerdo com Cantos Redondos e Transparência */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/3 bg-gradient-to-b from-primary/45 to-primary/45 rounded-tr-3xl rounded-br-3xl">
        <div className="absolute inset-0">
          <img
            src={carroImage}
            alt="Imagem de fundo - carro"
            className="object-cover w-full h-full mix-blend-overlay"
          />
        </div>
        <div className="relative flex flex-col w-full p-8">
          <div className="flex items-center gap-2 text-white">
            <img src="/car.svg" alt="Logo" className="w-10 h-10" />
            <span className="text-2xl font-semibold tracking-wide">UAU Clube Lavacar</span>
          </div>
          <div className="mt-auto">
            <h2 className="font-medium text-white">Sistema Administrativo</h2>
            <p className="text-sm text-white/80">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Painel Direito (Formulário de Recuperação de Senha) */}
      <div className="flex items-center justify-center w-full p-12 lg:w-2/3">
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-3">
            <button 
              className="flex items-center text-gray-500 hover:text-primary transition-colors"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao login
            </button>
            <h1 className="text-3xl font-semibold tracking-tight">Esqueci minha senha</h1>
            <p className="text-gray-500">
              Informe seu email para receber instruções de recuperação de senha.
            </p>
          </div>

          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
          )}
          
          {success && (
            <div className="p-4 text-green-700 bg-green-100 rounded">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5226] text-white hover:bg-[#FF5226]/90 px-4 rounded-full py-3"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 