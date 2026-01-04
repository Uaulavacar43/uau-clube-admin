import { apiWrapper } from "./api";

export const adminCarService = {
  activateCar(carId: number) {
    return apiWrapper<void>(`/admin-car/${carId}/activate`, {
      method: "PATCH",
    });
  },

  deactivateCar(carId: number) {
    return apiWrapper<void>(`/admin-car/${carId}/deactivate`, {
      method: "PATCH",
    });
  },

  reactivateCar(licensePlate: string, userId: number) {
    return apiWrapper<void>(
      `/admin-car/plate/${licensePlate}/user/${userId}/reactivate`,
      {
        method: "PATCH",
      }
    );
  },
};
