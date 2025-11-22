import {  useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/Label";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  role: string;
}

// Função auxiliar para remover caracteres não numéricos
const removeNonNumeric = (str: string) => str.replace(/\D/g, '');

export default function CreateUserPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      role: 'MANAGER',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Limpa as máscaras antes de enviar
      const cleanedData = {
        ...data,
        phone: removeNonNumeric(data.phone),
        cpf: removeNonNumeric(data.cpf),
      };

      await apiWrapper('/users', {
        method: 'POST',
        data: cleanedData,
      });
      navigate('/users');
    } catch (err) {
      const handledError = handleError(err);
      alert(handledError.message);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Novo usuário</h1>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/users')}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="primary"
            form="create-user-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <form id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-medium text-[#FF5226] mb-4">
              Dados do usuário
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome"
                  className="w-full"
                  {...register('name', { required: 'Nome é obrigatório' })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              {/* E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite o e-mail"
                  className="w-full"
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'E-mail inválido',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    validate: value => 
                      removeNonNumeric(value).length >= 10 || 
                      'Telefone deve ter pelo menos 10 dígitos'
                  }}
                  render={({ field }) => (
                    <InputMask
                      mask="(99) 99999-9999"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          className="w-full"
                        />
                      )}
                    </InputMask>
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Controller
                  name="cpf"
                  control={control}
                  rules={{
                    validate: value => 
                      removeNonNumeric(value).length === 11 || 
                      'CPF deve ter 11 dígitos'
                  }}
                  render={({ field }) => (
                    <InputMask
                      mask="999.999.999-99"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="cpf"
                          placeholder="000.000.000-00"
                          className="w-full"
                        />
                      )}
                    </InputMask>
                  )}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500">{errors.cpf.message}</p>
                )}
              </div>
              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha"
                  className="w-full"
                  {...register('password', { required: 'Senha é obrigatória' })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Tipo de Acesso */}
              <div className="space-y-2">
                <Label htmlFor="access-type">Tipo de acesso</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="MANAGER">Gerente</SelectItem>
                        <SelectItem value="USER">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
