import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Bell, Search, Send } from "lucide-react";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import Modal from "../../components/ui/Modal";
import SendNotificationForm from "./SendNotificationForm";

interface Notification {
	id: number;
	title: string;
	description: string;
	type: string;
	sentAt: string;
}

const NotificationHistory: React.FC = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchNotifications = async () => {
		try {
			setLoading(true);
			const data = await apiWrapper<Notification[]>("/notifications/list");
			setNotifications(data);
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, []);

	const filteredNotifications = notifications.filter(
		(notification) =>
			notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			notification.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("pt-BR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getTypeColor = (type: string) => {
		switch (type.toUpperCase()) {
			case "USER":
				return "bg-blue-100 text-blue-800";
			case "ADMIN":
				return "bg-green-100 text-green-800";
			case "MANAGER":
				return "bg-purple-100 text-purple-800";
			case "ALL":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const translateType = (type: string) => {
		switch (type.toUpperCase()) {
			case "USER":
				return "Usuário";
			case "ADMIN":
				return "Admin";
			case "MANAGER":
				return "Gerente";
			case "ALL":
				return "Todos";
			default:
				return "Todos";
		}
	};

	return (
		<div className="container max-w-6xl p-6 mx-auto">
			{/* Cabeçalho com título e botão voltar */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Histórico de Notificações</h1>
			</div>

			{/* Barra de busca e botão de enviar notificação */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-2">
					<Search className="w-5 h-5 text-gray-500" />
					<Input
						type="text"
						placeholder="Buscar notificações..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<Button
					className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
					onClick={() => setIsModalOpen(true)}
				>
					<Send className="w-4 h-4 mr-2" />
					Enviar Notificação
				</Button>
			</div>

			{/* Modal para enviar notificação */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			>
				<SendNotificationForm
					onClose={() => {
						setIsModalOpen(false);
						fetchNotifications();
					}}
				/>
			</Modal>

			{/* Tratamento de estados de carregamento e erros */}
			{loading ? (
				<div className="py-10 text-center">
					<p>Carregando notificações...</p>
				</div>
			) : error ? (
				<div className="py-10 text-center text-red-500">
					<p>Erro ao carregar notificações: {error}</p>
				</div>
			) : (
				<>
					{/* Tabela de notificações */}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Título</TableHead>
								<TableHead>Descrição</TableHead>
								<TableHead>Tipo</TableHead>
								<TableHead>Data de Envio</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredNotifications.map((notification) => (
								<TableRow key={notification.id}>
									<TableCell className="font-medium">
										{notification.title}
									</TableCell>
									<TableCell>{notification.description}</TableCell>
									<TableCell>
										<Badge className={getTypeColor(notification.type)}>
											{translateType(notification.type)}
										</Badge>
									</TableCell>
									<TableCell>{formatDate(notification.sentAt)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{/* Mensagem quando não há notificações */}
					{filteredNotifications.length === 0 && (
						<div className="py-10 text-center">
							<Bell className="w-12 h-12 mx-auto text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								Nenhuma notificação encontrada
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Não há notificações que correspondam à sua busca.
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default NotificationHistory;
