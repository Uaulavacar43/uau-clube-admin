import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useForm } from 'react-hook-form';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiError {
  message: string;
}

const ChangePasswordPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setSuccess(null);

      // Verifica se a nova senha é diferente da senha atual
      if (data.currentPassword === data.newPassword) {
        setError('A nova senha deve ser diferente da senha atual');
        return;
      }

      await apiWrapper(`/user-profile/password/${id}`, {
        method: 'PUT',
        data: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        },
      });

      setSuccess('Senha atualizada com sucesso!');
      reset();
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate(`/user-profile/profile/${id}`);
      }, 2000);
    } catch (err) {
      const handledError = handleError(err);
      const apiError = err as ApiError;
      
      // Trata os casos específicos de erro
      switch (handledError.code) {
        case 401:
          setError('Senha atual incorreta');
          break;
        case 403:
          setError('Você só pode alterar sua própria senha');
          break;
        case 400:
          setError(apiError.message || 'Erro ao atualizar senha');
          break;
        default:
          setError(handledError.message);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Trocar Senha</h1>
        <Button
          variant="primary"
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
          )}
          
          {success && (
            <div className="p-4 text-green-700 bg-green-100 rounded">{success}</div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••••"
                {...register('currentPassword', {
                  required: 'A senha atual é obrigatória',
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••••"
                {...register('newPassword', {
                  required: 'A nova senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'A nova senha deve ter pelo menos 6 caracteres',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••"
                {...register('confirmPassword', {
                  required: 'A confirmação de senha é obrigatória',
                  validate: value => 
                    value === newPassword || 'As senhas não coincidem'
                })}
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
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF5226] text-white hover:bg-[#FF5226]/90 px-4 rounded-full py-3"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
