import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Send, X } from 'lucide-react';
import { apiWrapper } from '../../services/api';
import handleError from '../../error/handleError';
import { z } from 'zod';

interface SendNotificationFormProps {
  onClose: () => void;
}

const SendNotificationSchema = z.object({
  title: z.string().nonempty("O título é obrigatório"),
  description: z.string().nonempty("A descrição é obrigatória"),
  type: z.enum(["USER", "MANAGER", "ALL"], {
    errorMap: () => ({ message: "Tipo de notificação inválido" }),
  }),
});

const SendNotificationForm: React.FC<SendNotificationFormProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar os dados usando zod
      const notificationData = SendNotificationSchema.parse({
        title,
        description,
        type,
      });

      setLoading(true);
      setError(null);

      await apiWrapper('/notifications/send', {
        method: 'POST',
        data: JSON.stringify(notificationData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Resetar o formulário após o envio
      setTitle('');
      setDescription('');
      setType('');

      // Fechar o modal
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Se houver erros de validação, mostramos a primeira mensagem de erro
        setError(err.errors[0].message);
      } else {
        // Tratar outros erros
        const handledError = handleError(err);
        setError(handledError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[500px] bg-white rounded-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Enviar Notificação</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Digite o título da notificação"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Digite a descrição da notificação"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Selecione o tipo de destinatário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
              disabled={loading}
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SendNotificationForm;
