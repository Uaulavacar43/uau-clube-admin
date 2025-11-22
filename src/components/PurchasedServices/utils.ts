export const formatCurrency = (value: number): string => {
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
};

export const formatDate = (date: Date): string => {
	return new Date(date).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const getStatusColor = (status: string): string => {
	switch (status.toLowerCase()) {
		case "completed":
		case "concluído":
		case "paid":
			return "bg-green-100 text-green-800";
		case "pending":
		case "pendente":
			return "bg-yellow-100 text-yellow-800";
		case "cancelled":
		case "cancelado":
		case "canceled":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

export const getStatusText = (status: string): string => {
	switch (status.toLowerCase()) {
		case "completed":
			return "Concluído";
		case "pending":
			return "Pendente";
		case "cancelled":
			return "Cancelado";
		default:
			return status;
	}
};

export const getPaymentStatus = (status: string): string => {
	switch (status.toLowerCase()) {
		case "paid":
			return "Pago";
		case "pending":
			return "Pendente";
		case "canceled":
			return "Cancelado";
		default:
			return status;
	}
};
