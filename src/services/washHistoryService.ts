import { apiWrapper } from "./api";
import type { WashHistoryResponse } from "../types/WashHistory";

export const fetchUserWashHistory = async (
  userId: string | number,
  page: number = 1,
  pageSize: number = 10
): Promise<WashHistoryResponse> => {
  return await apiWrapper<WashHistoryResponse>(
    `/daily-wash/user/${userId}/history?page=${page}&pageSize=${pageSize}`
  );
};
