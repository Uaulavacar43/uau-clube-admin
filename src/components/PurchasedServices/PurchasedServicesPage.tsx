import { useEffect, useState } from "react";
import { APIResponse, IndividualServicePurchase, SearchFilters } from "./types";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { apiWrapper } from "../../services/api";
import handleError from "../../error/handleError";
import ErrorDisplay from "./ErrorDisplay";
import SearchAndFilters from "./SearchAndFilters";
import ServicesList from "./ServicesList";
import PaginationWithEllipsis from "../PaginationWithEllipsis";

function PurchasedServicesPage() {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [purchasedServices, setPurchasedServices] = useState<IndividualServicePurchase[]>([]);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [searchInput, setSearchInput] = useState<string>("");
	const [filters, setFilters] = useState<SearchFilters>({
		search: "",
		orderBy: "createdAt",
		order: "desc"
	});
	const [currentPage, setCurrentPage] = useState<number>(1);

	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user?.role !== 'ADMIN') {
			navigate('/login');
			return;
		}

		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await apiWrapper<APIResponse>(`/wash-services/top-sold`, {
					params: {
						page: currentPage,
						search: filters.search,
						orderBy: filters.orderBy,
						order: filters.order,
					}
				});
				setPurchasedServices(response.individualServicePurchase);
				setTotalPages(response.totalPages);
			} catch (err) {
				const handledError = handleError(err);
				setError(handledError.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, filters]);

	const handleSearch = () => {
		setFilters(prev => ({ ...prev, search: searchInput.trim() }));
		setCurrentPage(1); // Reset to first page when searching
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setFilters(prev => ({ ...prev, search: "" }));
		setCurrentPage(1);
	};

	const handleOrderByChange = (value: string) => {
		setFilters(prev => ({ ...prev, orderBy: value }));
	};

	const handleOrderChange = (value: string) => {
		setFilters(prev => ({ ...prev, order: value }));
	};



	if (error) {
		return <ErrorDisplay error={error} />;
	}

	return (
		<div className="container p-6 mx-auto max-w-7xl">
			<div className="flex flex-col gap-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Serviços Comprados
						</h1>
					</div>
				</div>

				{/* Search and Filters */}
				<SearchAndFilters
					searchInput={searchInput}
					setSearchInput={setSearchInput}
					filters={filters}
					setOrderBy={handleOrderByChange}
					setOrder={handleOrderChange}
					onSearch={handleSearch}
					onClearSearch={handleClearSearch}
				/>

				{/* Services List */}
				<ServicesList services={purchasedServices} loading={loading} />

				{/* Pagination */}
				<PaginationWithEllipsis
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			</div>
		</div>
	)
}

export default PurchasedServicesPage
