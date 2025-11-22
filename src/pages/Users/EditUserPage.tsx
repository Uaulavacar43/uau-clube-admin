import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

interface User {
	id: number;
	name: string;
	email: string;
	phone: string;
	role: string;
}

export default function EditUserPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Estados para los campos del formulario
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [phone, setPhone] = useState<string>("");
	const [role, setRole] = useState<string>("");

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userResponse = await apiWrapper<User>(`/users/${id}`);
				setUser(userResponse);
				setName(userResponse.name);
				setEmail(userResponse.email);
				setPhone(userResponse.phone || "");
				setRole(userResponse.role);
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError(null);

			const updatedUser = {
				name,
				email,
				phone,
				role,
			};

			await apiWrapper(`/users/${id}`, {
				method: "PUT",
				data: updatedUser,
			});

			navigate("/users");
		} catch (err) {
			const handledError = handleError(err);
			setError(handledError.message);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className="p-6">Carregando dados do usuário...</div>;
	}

	if (error) {
		return (
			<div className="p-6 text-red-500">
				Ocorreu um erro: {error}
				<Button onClick={() => navigate("/users")} className="mt-4">
					Voltar aos Usuários
				</Button>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="p-6">
				<p>Nenhum usuário encontrado.</p>
				<Button onClick={() => navigate("/users")} className="mt-4">
					Voltar aos Usuários
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-3xl p-6 mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold">Editar usuário</h1>
				<div className="flex gap-3">
					<Button
						variant="primary"
						onClick={() => navigate("/users")}
					>
						Voltar
					</Button>
					<Button
						variant="primary"
						onClick={handleSubmit}
						disabled={saving}
					>
						{saving ? "Salvando..." : "Salvar"}
					</Button>
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit}>
				<div className="space-y-8">
					<div>
						<h2 className="text-lg font-medium text-[#FF5226] mb-4">
							Dados do usuário
						</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="name">Nome</Label>
								<Input
									id="name"
									className="w-full"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">E-mail</Label>
								<Input
									id="email"
									type="email"
									className="w-full"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">Telefone</Label>
								<Input
									id="phone"
									type="tel"
									className="w-full"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="access-type">Tipo de acesso</Label>
								<Select onValueChange={(value) => setRole(value)} value={role}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Selecione o tipo de acesso" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ADMIN">Administrador</SelectItem>
										<SelectItem value="MANAGER">Gerente</SelectItem>
										<SelectItem value="USER">Usuário</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
