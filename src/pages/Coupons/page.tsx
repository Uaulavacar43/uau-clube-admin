import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/date';
import { Trash2, Edit, PlusCircle, AlertCircle} from 'lucide-react';
import { couponService, Coupon } from '../../services/couponService';

export default function CouponsPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const couponsData = await couponService.listCoupons();
      setCoupons(couponsData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar cupons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      setIsDeleting(true);
      await couponService.deleteCoupon(couponToDelete.id);
      setCoupons(prev => prev.filter(coupon => coupon.id !== couponToDelete.id));
      setShowDeleteModal(false);
      setCouponToDelete(null);
    } catch (err) {
      setError('Erro ao excluir cupom');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const renderDiscountValue = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    } else {
      return formatCurrency(coupon.discountValue);
    }
  };

  const formatDateRange = (from: Date, until: Date) => {
    return `${formatDate(from.toISOString())} - ${formatDate(until.toISOString())}`;
  };

  const isCouponActive = (coupon: Coupon) => {
    if (!coupon.isActive) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5226]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Cupons de Desconto</h1>
        <Button
          onClick={() => navigate('/coupons/new')}
          className="flex items-center gap-2 bg-[#FF5226] hover:bg-[#FF5226]/90 text-white"
        >
          <PlusCircle className="w-4 h-4" />
          Novo Cupom
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>
      )}

      {coupons.length === 0 ? (
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum cupom encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Clique no botão "Novo Cupom" para adicionar um cupom.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desconto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/*
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usos
                  </th>
                  */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{coupon.description}</div>
                      {coupon.additionalInfo && (
                        <div className="text-xs text-gray-400 mt-1">{coupon.additionalInfo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderDiscountValue(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateRange(coupon.validFrom, coupon.validUntil)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCouponActive(coupon) ? (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                      )}
                    </td>
                    {/*
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.usageCount}
                      {coupon.usageLimit && (
                        <span className="text-gray-400"> / {coupon.usageLimit}</span>
                      )}
                    </td>
                    */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/coupons/edit/${coupon.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(coupon)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-600 mb-4">
              Você está prestes a excluir o cupom <strong>{couponToDelete?.code}</strong>.
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCouponToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Cupom'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 