// src/services/adminCarService.ts
import { apiWrapper } from "./api";
import type { AdminUpdateCarDTO, Car } from "./vehicleService";

const normalizePlate = (value: string) =>
    (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

function normalizeCarResponse(raw: any): Car {
    // O backend usa "licensePlate" nas rotas/docs, mas teu legado usa "plate".
    // Então garantimos que o objeto final sempre tenha "plate".
    const plateFromApi = typeof raw?.plate === "string" ? raw.plate : (typeof raw?.licensePlate === "string" ? raw.licensePlate : "");

    return {
        id: Number(raw?.id ?? 0),
        userId: Number(raw?.userId ?? 0),
        brand: String(raw?.brand ?? ""),
        model: String(raw?.model ?? ""),
        color: String(raw?.color ?? ""),
        year: Number(raw?.year ?? 0),
        plate: String(plateFromApi ?? ""),
        createdAt: String(raw?.createdAt ?? new Date().toISOString()),
        updatedAt: String(raw?.updatedAt ?? new Date().toISOString()),
        subscriptions: Array.isArray(raw?.subscriptions) ? raw.subscriptions : [],
    };
}

class AdminCarService {
    async getCarByPlate(licensePlate: string, includeInactive: boolean = true): Promise<Car> {
        const plate = normalizePlate(licensePlate);

        const response = await apiWrapper<any>(`/admin-car/plate/${plate}`, {
            params: { includeInactive: includeInactive ? "true" : "false" },
        });

        return normalizeCarResponse(response);
    }

    async getCarByPlateAndUserId(licensePlate: string, userId: number, includeInactive: boolean = true): Promise<Car> {
        const plate = normalizePlate(licensePlate);

        const response = await apiWrapper<any>(`/admin-car/plate/${plate}/user/${userId}`, {
            params: { includeInactive: includeInactive ? "true" : "false" },
        });

        return normalizeCarResponse(response);
    }

    async activateCar(carId: number): Promise<Car> {
        const response = await apiWrapper<any>(`/admin-car/${carId}/activate`, {
            method: "PATCH",
        });

        return normalizeCarResponse(response);
    }

    async deactivateCar(carId: number): Promise<Car> {
        const response = await apiWrapper<any>(`/admin-car/${carId}/deactivate`, {
            method: "PATCH",
        });

        return normalizeCarResponse(response);
    }

    async reactivateCarByPlateAndUserId(licensePlate: string, userId: number): Promise<Car> {
        const plate = normalizePlate(licensePlate);

        const response = await apiWrapper<any>(`/admin-car/plate/${plate}/user/${userId}/reactivate`, {
            method: "PATCH",
        });

        return normalizeCarResponse(response);
    }

    async updateCar(payload: AdminUpdateCarDTO): Promise<Car> {
        // garante padrão de placa enviado
        const normalizedPayload: AdminUpdateCarDTO = {
            ...payload,
            licensePlate: payload.licensePlate ? normalizePlate(payload.licensePlate) : payload.licensePlate,
        };

        const response = await apiWrapper<any, AdminUpdateCarDTO>(`/admin-car`, {
            method: "PUT",
            data: normalizedPayload,
        });

        return normalizeCarResponse(response);
    }
}

export const adminCarService = new AdminCarService();
