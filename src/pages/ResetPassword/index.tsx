import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { ArrowLeft, EyeIcon, EyeOffIcon, AlertCircle } from 'lucide-react';
import carroImage from '../../assets/carro.jpg';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenExpiration, setTokenExpiration] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Extrair token e email da URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    const emailParam = queryParams.get('email');

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      validateToken(tokenParam, emailParam);
    } else {
      setValidatingToken(false);
      setError('Link de redefinição de senha inválido. Verifique se você usou o link correto do email.');
    }
  }, [location.search]);

  // Validar o token
  const validateToken = async (token: string, email: string) => {
    setValidatingToken(true);
    try {
      const response = await apiWrapper<{valid: boolean, expiresAt?: string}>(`/auth/validate-reset-token?token=${token}&email=${email}`, {
        method: 'GET'
      });

      setTokenValid(response.valid);
      if (response.expiresAt) {
        setTokenExpiration(response.expiresAt);
      }
      
      if (!response.valid) {
        setError('O link de redefinição de senha expirou ou é inválido. Por favor, solicite um novo link.');
      }
    } catch (err) {
      const handledError = handleError(err);
      setError(handledError.message || 'Erro ao validar o token. Por favor, tente novamente.');
      setTokenValid(false);
    } finally {
      setValidatingToken(false);
    }
  };

  // Resetar a senha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiWrapper('/auth/reset-password', {
        method: 'POST',
        data: {
          email,
          token,
          password
        }
      });

      setSuccess('Senha redefinida com sucesso! Você será redirecionado para a página de login.');
      
      // Redireciona após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const handledError = handleError(err);
      setError(handledError.message || 'Erro ao redefinir a senha');
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

      {/* Painel Direito (Formulário de Redefinição de Senha) */}
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
            <h1 className="text-3xl font-semibold tracking-tight">Redefinir senha</h1>
            <p className="text-gray-500">
              Digite sua nova senha para redefinir o acesso à sua conta.
            </p>
          </div>

          {/* Exibir mensagem de validação de token */}
          {validatingToken && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">Validando link de redefinição...</span>
            </div>
          )}

          {/* Exibir erros */}
          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Exibir sucesso */}
          {success && (
            <div className="p-4 text-green-700 bg-green-100 rounded">{success}</div>
          )}

          {/* Formulário de redefinição de senha */}
          {!validatingToken && tokenValid && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {tokenExpiration && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                  Este link expira em: {new Date(tokenExpiration).toLocaleString()}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF5226] text-white hover:bg-[#FF5226]/90 px-4 rounded-full py-3"
              >
                {loading ? 'Redefinindo senha...' : 'Redefinir senha'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 