export interface Car {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  year: number;
}

export interface WashLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

export interface DailyWash {
  id: number;
  carId: number;
  washDate: string;
  createdAt: string;
  updatedAt: string;
  washLocationId?: number | null;
  car?: Car;
  washLocation?: WashLocation;
}

export interface WashHistoryResponse {
  washes: DailyWash[];
  total: number;
}
