import React, { useState, useEffect } from 'react';
import { FacilityApi, Facility } from '@/api/facilityApi';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface FacilityFormData {
  name: string;
  type: 'PEM' | 'ALK' | 'SOEC';
  maker: string;
  model: string;
  powerKw: number;
  h2Rate: number;
  specKwh: number;
  purity: number;
  pressure: number;
  location: string;
  install: string;
}

const initialFormData: FacilityFormData = {
  name: '',
  type: 'PEM',
  maker: '',
  model: '',
  powerKw: 0,
  h2Rate: 0,
  specKwh: 0,
  purity: 0,
  pressure: 0,
  location: '',
  install: '',
};

export default function FacilityManagement() {
  const { orgId } = useAuthStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<FacilityFormData>(initialFormData);
  const [error, setError] = useState<string>('');

  // 시설 목록 조회
  const loadFacilities = async () => {
    try {
      setLoading(true);
      const data = await FacilityApi.getFacilities(orgId);
      setFacilities(data);
    } catch (error) {
      console.error('시설 목록 조회 실패:', error);
      setError('시설 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 시설 추가/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      const facilityData = {
        ...formData,
        orgId: orgId!,
        powerKw: Number(formData.powerKw),
        h2Rate: Number(formData.h2Rate),
        specKwh: Number(formData.specKwh),
        purity: Number(formData.purity),
        pressure: Number(formData.pressure),
      };

      if (editingFacility) {
        // 수정
        await FacilityApi.updateFacility({
          ...facilityData,
          facId: editingFacility.facId,
          created: editingFacility.created,
        });
      } else {
        // 추가
        await FacilityApi.createFacility(facilityData);
      }

      setIsModalOpen(false);
      setEditingFacility(null);
      setFormData(initialFormData);
      loadFacilities();
    } catch (error) {
      console.error('시설 저장 실패:', error);
      setError('시설 저장에 실패했습니다.');
    }
  };

  // 시설 삭제
  const handleDelete = async (facilityId: number) => {
    if (!confirm('정말로 이 시설을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await FacilityApi.deleteFacility(facilityId);
      loadFacilities();
    } catch (error) {
      console.error('시설 삭제 실패:', error);
      setError('시설 삭제에 실패했습니다.');
    }
  };

  // 수정 모드로 전환
  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      maker: facility.maker || '',
      model: facility.model || '',
      powerKw: facility.powerKw,
      h2Rate: facility.h2Rate,
      specKwh: facility.specKwh,
      purity: facility.purity || 0,
      pressure: facility.pressure || 0,
      location: facility.location || '',
      install: facility.install || '',
    });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
    setFormData(initialFormData);
    setError('');
  };

  // 새 시설 추가
  const handleAddNew = () => {
    setEditingFacility(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    loadFacilities();
  }, [orgId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-black dark:text-white">시설 관리</h2>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white">
          시설 추가
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {facilities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">등록된 시설이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">시설명</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">타입</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">제조사</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">모델</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">정격전력(kW)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">수소생산량(kg/h)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">작업</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr key={facility.facId} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{facility.name}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{facility.type}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{facility.maker || '-'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{facility.model || '-'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{facility.powerKw}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{facility.h2Rate}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEdit(facility)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                      >
                        수정
                      </Button>
                      <Button
                        onClick={() => handleDelete(facility.facId!)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 시설 추가/수정 모달 */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-black dark:text-white mb-4">
            {editingFacility ? '시설 수정' : '시설 추가'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  시설명 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  전해조 타입 *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PEM' | 'ALK' | 'SOEC' })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PEM">PEM</option>
                  <option value="ALK">ALK</option>
                  <option value="SOEC">SOEC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제조사
                </label>
                <input
                  type="text"
                  value={formData.maker}
                  onChange={(e) => setFormData({ ...formData, maker: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  모델
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  정격 전력(kW) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.powerKw}
                  onChange={(e) => setFormData({ ...formData, powerKw: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  수소 생산량(kg/h) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.h2Rate}
                  onChange={(e) => setFormData({ ...formData, h2Rate: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  특정 소비전력(kWh/kg) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.specKwh}
                  onChange={(e) => setFormData({ ...formData, specKwh: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  수소 순도(%)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  인출 압력(bar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pressure}
                  onChange={(e) => setFormData({ ...formData, pressure: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설치 위치
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설치 일자
                </label>
                <input
                  type="date"
                  value={formData.install}
                  onChange={(e) => setFormData({ ...formData, install: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingFacility ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
