// src/pages/admin/AdminCarPage.tsx
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Car as CarIcon, Search, ShieldCheck, ShieldX, RefreshCcw, Save } from "lucide-react";

import { adminCarService } from "../../services/adminCarService";
import handleError from "../../error/handleError";

import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";

import type { AdminUpdateCarDTO, Car } from "../../services/vehicleService";

const normalizePlate = (value: string) =>
    (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

export default function AdminCarPage() {
    const [plateInput, setPlateInput] = useState<string>("");
    const [userIdInput, setUserIdInput] = useState<string>("");
    const [includeInactive, setIncludeInactive] = useState<boolean>(true);

    const [car, setCar] = useState<Car | null>(null);

    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
    const [loadingAction, setLoadingAction] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState<boolean>(false);

    const parsedUserId = useMemo(() => {
        const n = Number(userIdInput);
        if (!userIdInput) return null;
        if (Number.isNaN(n) || n <= 0) return null;
        return n;
    }, [userIdInput]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AdminUpdateCarDTO>({
        defaultValues: {
            carId: 0,
            userId: 0,
            licensePlate: "",
            brand: "",
            model: "",
            color: "",
            year: undefined,
        },
    });

    const canUpdate = Boolean(car && car.id && car.userId);

    const fillFormFromCar = (c: Car) => {
        reset({
            carId: c.id,
            userId: c.userId,
            licensePlate: c.plate,
            brand: c.brand,
            model: c.model,
            color: c.color,
            year: c.year || undefined,
        });
    };

    const handleSearch = async () => {
        setError(null);

        const plate = normalizePlate(plateInput);
        if (!plate) {
            setError("Informe uma placa válida.");
            return;
        }

        setLoadingSearch(true);
        try {
            let found: Car;

            if (parsedUserId) {
                found = await adminCarService.getCarByPlateAndUserId(plate, parsedUserId, includeInactive);
            } else {
                found = await adminCarService.getCarByPlate(plate, includeInactive);
            }

            setCar(found);
            fillFormFromCar(found);
            toast.success("Carro encontrado.");
        } catch (err) {
            const handled = handleError(err);
            setCar(null);
            setError(handled.message);
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleActivate = async () => {
        if (!car) return;

        setLoadingAction(true);
        setError(null);
        try {
            const updated = await adminCarService.activateCar(car.id);
            setCar(updated);
            fillFormFromCar(updated);
            toast.success("Carro ativado com sucesso!");
        } catch (err) {
            const handled = handleError(err);
            setError(handled.message);
            toast.error(handled.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDeactivate = async () => {
        if (!car) return;

        setLoadingAction(true);
        setError(null);
        try {
            const updated = await adminCarService.deactivateCar(car.id);
            setCar(updated);
            fillFormFromCar(updated);
            toast.success("Carro desativado com sucesso!");
        } catch (err) {
            const handled = handleError(err);
            setError(handled.message);
            toast.error(handled.message);
        } finally {
            setLoadingAction(false);
            setConfirmDeactivateOpen(false);
        }
    };

    const handleReactivateByPlateAndUser = async () => {
        setError(null);

        const plate = normalizePlate(plateInput);
        if (!plate) {
            setError("Informe uma placa válida para reativação.");
            return;
        }
        if (!parsedUserId) {
            setError("Informe um userId válido para reativação por placa + usuário.");
            return;
        }

        setLoadingAction(true);
        try {
            const updated = await adminCarService.reactivateCarByPlateAndUserId(plate, parsedUserId);
            setCar(updated);
            fillFormFromCar(updated);
            toast.success("Carro reativado (placa + usuário) com sucesso!");
        } catch (err) {
            const handled = handleError(err);
            setError(handled.message);
            toast.error(handled.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const onSubmitUpdate = async (data: AdminUpdateCarDTO) => {
        if (!canUpdate) {
            setError("Busque um carro antes de atualizar.");
            return;
        }

        setError(null);

        try {
            const payload: AdminUpdateCarDTO = {
                carId: Number(data.carId),
                userId: Number(data.userId),
                licensePlate: data.licensePlate ? normalizePlate(data.licensePlate) : undefined,
                brand: data.brand?.trim() ? data.brand.trim() : undefined,
                model: data.model?.trim() ? data.model.trim() : undefined,
                color: data.color?.trim() ? data.color.trim() : undefined,
                year: typeof data.year === "number" && data.year > 0 ? Number(data.year) : undefined,
            };

            const updated = await adminCarService.updateCar(payload);
            setCar(updated);
            fillFormFromCar(updated);
            toast.success("Carro atualizado com sucesso!");
        } catch (err) {
            const handled = handleError(err);
            setError(handled.message);
            toast.error(handled.message);
        }
    };

    return (
        <div className="container p-6 mx-auto max-w-6xl">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="heading-primary flex items-center gap-2">
                        <CarIcon className="w-6 h-6 text-[#FF5226]" />
                        Gestão de veículos (Admin)
                    </h1>
                </div>

                <Card className="border-none shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Search className="w-5 h-5 text-[#FF5226]" />
                            Buscar carro
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="plate">Placa</Label>
                                <Input
                                    id="plate"
                                    value={plateInput}
                                    placeholder="Ex: ABC1D23"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlateInput(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="userId">User ID (opcional)</Label>
                                <Input
                                    id="userId"
                                    type="number"
                                    value={userIdInput}
                                    placeholder="Ex: 45"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserIdInput(e.target.value)}
                                />
                                <p className="text-xs text-gray-500">
                                    Se informar userId, o front chama: <span className="font-mono">GET /admin-car/plate/:licensePlate/user/:userId</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Opções</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="includeInactive"
                                        className="h-4 w-4 text-[#FF5226] focus:ring-[#FF5226] border-gray-300 rounded"
                                        checked={includeInactive}
                                        onChange={(e) => setIncludeInactive(e.target.checked)}
                                    />
                                    <label htmlFor="includeInactive" className="text-sm text-gray-700">
                                        Incluir inativos
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Envia <span className="font-mono">?includeInactive=true|false</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 md:items-center">
                            <Button
                                className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
                                onClick={handleSearch}
                                disabled={loadingSearch || loadingAction}
                            >
                                {loadingSearch ? "Buscando..." : "Buscar"}
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setPlateInput("");
                                    setUserIdInput("");
                                    setCar(null);
                                    setError(null);
                                    reset({
                                        carId: 0,
                                        userId: 0,
                                        licensePlate: "",
                                        brand: "",
                                        model: "",
                                        color: "",
                                        year: undefined,
                                    });
                                }}
                                disabled={loadingSearch || loadingAction}
                            >
                                Limpar
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleReactivateByPlateAndUser}
                                disabled={loadingSearch || loadingAction}
                                className="text-[#FF5226] hover:text-[#FF5226]/90 hover:bg-[#FF5226]/10"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Reativar (placa + userId)
                            </Button>
                        </div>

                        {error && (
                            <div className="p-3 rounded bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {car && (
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium">
                                Detalhes do carro
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="p-3 rounded bg-gray-50">
                                    <p className="text-xs text-gray-500">Car ID</p>
                                    <p className="font-medium">{car.id}</p>
                                </div>

                                <div className="p-3 rounded bg-gray-50">
                                    <p className="text-xs text-gray-500">User ID</p>
                                    <p className="font-medium">{car.userId}</p>
                                </div>

                                <div className="p-3 rounded bg-gray-50">
                                    <p className="text-xs text-gray-500">Placa</p>
                                    <p className="font-medium">{car.plate}</p>
                                </div>

                                <div className="p-3 rounded bg-gray-50">
                                    <p className="text-xs text-gray-500">Veículo</p>
                                    <p className="font-medium">
                                        {car.brand} {car.model} ({car.year})
                                    </p>
                                    <p className="text-sm text-gray-600">Cor: {car.color}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2">
                                <Button
                                    onClick={handleActivate}
                                    disabled={loadingAction || loadingSearch}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    Ativar (PATCH /admin-car/:carId/activate)
                                </Button>

                                <Button
                                    onClick={() => setConfirmDeactivateOpen(true)}
                                    disabled={loadingAction || loadingSearch}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <ShieldX className="w-4 h-4 mr-2" />
                                    Desativar (PATCH /admin-car/:carId/deactivate)
                                </Button>
                            </div>

                            <AlertDialog open={confirmDeactivateOpen} onOpenChange={setConfirmDeactivateOpen}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar desativação</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja desativar o carro <strong>{car.brand} {car.model}</strong> (placa <strong>{car.plate}</strong>)?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={loadingAction}>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeactivate}
                                            disabled={loadingAction}
                                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                        >
                                            {loadingAction ? "Desativando..." : "Desativar"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-none shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Save className="w-5 h-5 text-[#FF5226]" />
                            Atualizar carro (PUT /admin-car)
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="carId">Car ID</Label>
                                    <Controller
                                        name="carId"
                                        control={control}
                                        rules={{ required: "carId é obrigatório" }}
                                        render={({ field }) => (
                                            <Input
                                                id="carId"
                                                type="number"
                                                placeholder="Ex: 123"
                                                value={String(field.value ?? "")}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                    />
                                    {errors.carId && <p className="text-sm text-red-500">{String(errors.carId.message)}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="userIdForm">User ID</Label>
                                    <Controller
                                        name="userId"
                                        control={control}
                                        rules={{ required: "userId é obrigatório" }}
                                        render={({ field }) => (
                                            <Input
                                                id="userIdForm"
                                                type="number"
                                                placeholder="Ex: 45"
                                                value={String(field.value ?? "")}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                    />
                                    {errors.userId && <p className="text-sm text-red-500">{String(errors.userId.message)}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="licensePlate">Placa (licensePlate)</Label>
                                    <Controller
                                        name="licensePlate"
                                        control={control}
                                        rules={{
                                            required: "Placa é obrigatória",
                                            minLength: { value: 7, message: "Placa deve ter no mínimo 7 caracteres" },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                id="licensePlate"
                                                placeholder="Ex: ABC1D23"
                                                value={String(field.value ?? "")}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(normalizePlate(e.target.value))}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                    />
                                    {errors.licensePlate && <p className="text-sm text-red-500">{String(errors.licensePlate.message)}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand">Marca</Label>
                                    <Controller
                                        name="brand"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="brand"
                                                placeholder="Ex: Toyota"
                                                value={String(field.value ?? "")}
                                                onChange={field.onChange}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="model">Modelo</Label>
                                    <Controller
                                        name="model"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="model"
                                                placeholder="Ex: Corolla"
                                                value={String(field.value ?? "")}
                                                onChange={field.onChange}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="color">Cor</Label>
                                    <Controller
                                        name="color"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="color"
                                                placeholder="Ex: Prata"
                                                value={String(field.value ?? "")}
                                                onChange={field.onChange}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="year">Ano</Label>
                                    <Controller
                                        name="year"
                                        control={control}
                                        rules={{
                                            min: { value: 1900, message: "Ano inválido" },
                                            max: { value: new Date().getFullYear() + 1, message: "Ano inválido" },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                id="year"
                                                type="number"
                                                placeholder="Ex: 2020"
                                                value={field.value === undefined ? "" : String(field.value)}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const n = Number(e.target.value);
                                                    field.onChange(Number.isNaN(n) ? undefined : n);
                                                }}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                    />
                                    {errors.year && <p className="text-sm text-red-500">{String(errors.year.message)}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
                                    disabled={!canUpdate || isSubmitting || loadingAction || loadingSearch}
                                >
                                    {isSubmitting ? "Salvando..." : "Salvar alterações"}
                                </Button>
                            </div>

                            {!canUpdate && (
                                <p className="text-sm text-gray-500">
                                    Busque um carro primeiro para preencher o formulário automaticamente.
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
