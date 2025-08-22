import FacilitiesFrom from "@/components/FacilitiesFrom";
import UpdateFaForm from "@/components/UpdateFaForm";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RegiFrom from "@/components/UserRegiForm";
import { useAdmin } from "@/hooks/useAdmin";
import { Select } from "@radix-ui/react-select";
import { useEffect, useState } from "react";

export default function Admin() {

  const [isOpen, setIsOpen] = useState(false);
  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    userId: string;
    currentStatus: string;
    newStatus: string;
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    currentStatus: "",
    newStatus: "",
    userName: ""
  });

  const { getUsers, updateUserStatusAction, getFacilities, loading, error } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "SUSPENDED" | "ALL">("ALL");
  const [openFacilityUserId, setOpenFacilityUserId] = useState<string | null>(null); // 유저 아이디 기준으로 시설 리스트 띄울 공간 띄우기
  const [facilities, setFacilities] = useState<any>([]); // 시설 리스트
  const [facilityLoading, setFacilityLoading] = useState<{ [key: string]: boolean }>({}); // 시설 로딩 상태
  const [facilityOpen, setFacilityOpen] = useState(false); // 시설 추가 모달 열기/닫기
  const [editFacilityOpen, setEditFacilityOpen] = useState(false); // 시설 수정 모달 열기/닫기
  const [selectedFacility, setSelectedFacility] = useState<any>(null); // 선택된 시설 정보

  useEffect(() => {
    getUsers().then(setUsers);
  }, [getUsers])

  if (loading) return <div className="h-full p-6"><p className="text-center text-lg">로딩 중...</p></div>;
  if (error) return <div className="h-full p-6"><p className="text-center text-lg text-red-600">오류: {error}</p></div>;

  const filteredUsers = users.filter(u => {
    // 상태 필터링
    const statusMatch = statusFilter === "ALL" || u.status === statusFilter;

    // 검색어가 없으면 상태만 확인
    if (!search.trim()) return statusMatch;

    // 검색어가 있으면 다음 필드들에서 검색
    const searchLower = search.toLowerCase();
    const emailMatch = u.email?.toLowerCase().includes(searchLower) || false;
    const orgNameMatch = u.orgname?.toLowerCase().includes(searchLower) || false;
    const organizationNameMatch = u.organizationName?.toLowerCase().includes(searchLower) || false;
    const bizRegNoMatch = u.bizRegNo?.toLowerCase().includes(searchLower) || false;

    return statusMatch && (emailMatch || orgNameMatch || organizationNameMatch || bizRegNoMatch);
  });

  // 상태 변경 핸들러
  const handleStatusChange = (userId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setStatusChangeModal({
      isOpen: true,
      userId,
      currentStatus,
      newStatus,
      userName
    });
  };

  // 상태 변경 확인
  const confirmStatusChange = async () => {
    const { userId, newStatus } = statusChangeModal;
    const result = await updateUserStatusAction(userId, newStatus);

    if (result) {
      // 사용자 목록 새로고침
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      setStatusChangeModal({ ...statusChangeModal, isOpen: false });
      alert("사용자 상태가 변경되었습니다.");
    } else {
      alert("상태 변경에 실패했습니다.");
    }
  };

  // 시설 관리 열기/닫기 핸들러
  const handleFacilityOpen = async (userId: string, orgId: number) => {
    if (openFacilityUserId === userId) {
      setOpenFacilityUserId(null);
      return;
    }

    setOpenFacilityUserId(userId);
    setFacilityLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const facilityList = await getFacilities(orgId);
      console.log('시설 목록 조회 결과:', facilityList);
      console.log('시설 목록 타입:', typeof facilityList);
      console.log('시설 목록 길이:', facilityList?.length);
      setFacilities(facilityList);
    } catch (error) {
      console.error('시설 목록 조회 실패:', error);
      setFacilities([]);
    } finally {
      setFacilityLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="h-full p-6">
      <div className="flex ">
        <p className="text-2xl font-bold mb-6">관리자 페이지</p>
        <button onClick={() => setIsOpen(true)} className="bg-blue-500 text-white px-3 py-2 rounded-md w-24 h-10 mx-3">회원 추가</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          회원 등록
          <RegiFrom />
        </Modal>

        {/* 상태 변경 확인 모달 */}
        <Modal isOpen={statusChangeModal.isOpen} onClose={() => setStatusChangeModal({ ...statusChangeModal, isOpen: false })}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">사용자 상태 변경 확인</h3>
            <p className="mb-4">
              <strong>{statusChangeModal.userName}</strong> 사용자의 상태를<br />
              <span className="font-semibold"
                style={{
                  color: statusChangeModal.currentStatus === "ACTIVE" ? "rgb(16, 185, 53)" : "rgb(236, 45, 45)",
                }}>
                {statusChangeModal.currentStatus === "ACTIVE" ? "활성화" : "비활성화"}
              </span>에서
              <span className="font-semibold"
                style={{
                  color: statusChangeModal.newStatus === "ACTIVE" ? "rgb(16, 185, 53)" : "rgb(236, 45, 45)",
                }}>
                {statusChangeModal.newStatus === "ACTIVE" ? "활성화" : "비활성화"}
              </span>로 변경하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setStatusChangeModal({ ...statusChangeModal, isOpen: false })}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                확인
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* 요약 통계 */}
      <div className="flex gap-6 mb-6">
        <Card className="flex-1 text-center">
          <CardContent>
            <p className="text-green-600 text-2xl font-bold">{users.filter(u => u.status === "ACTIVE").length}</p>
            <p>활성화된 계정</p>
          </CardContent>
        </Card>
        <Card className="flex-1 text-center">
          <CardContent>
            <p className="text-red-600 text-2xl font-bold">{users.filter(u => u.status === "SUSPENDED").length}</p>
            <p>비활성화된 계정</p>
          </CardContent>
        </Card>
        <Card className="flex-1 text-center">
          <CardContent>
            <p className="text-gray-800 text-2xl font-bold">{users.length}</p>
            <p>전체 계정</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col h-2/3 w-full bg-white rounded-2xl shadow overflow-y-scroll">
        {/* 검색  + 필터 */}
        <div className="flex mb-4 sticky top-0 bg-white z-10 pb-4 mb-4 border-b pt-3 px-3">
          <Input
            placeholder="소속, 이메일, 이름, 사업자번호로 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-1/3 rounded-3xl bg-gray-200"
          />
          <Select onValueChange={(val) => setStatusFilter(val as any)} defaultValue="ALL">
            <SelectTrigger className="w-[120px] rounded-3xl mx-3">
              <SelectValue placeholder="계정 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">활성화</SelectItem>
              <SelectItem value="SUSPENDED">비활성화</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 테이블 */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search.trim() ? `"${search}"에 대한 검색 결과가 없습니다.` : "사용자가 없습니다."}
          </div>
        ) : (
          <table className="m-5">
            <thead>
              <tr className="border-b border-gray-300" >
                <th className="text-center py-2">소속</th>
                <th className="text-center py-2">이메일(ID)</th>
                <th className="text-center py-2">이름</th>
                <th className="text-center py-2">사업자 등록번호</th>
                <th className="text-center py-2">최근 로그인</th>
                <th className="text-center py-2">계정 상태</th>
                <th className="text-center py-2">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <>
                  <tr key={u.userId}>
                    <td>{u.orgname}</td>
                    <td>{u.email}</td>
                    <td>{u.organizationName}</td>
                    <td className="text-left">{u.bizRegNo}</td>
                    <td className="text-center">{u.userUpdatedAt.split("T")[0]}</td>
                    <td className="text-center">
                      <div className="w-20 mx-auto">
                        <Button
                          onClick={() => handleStatusChange(u.userId, u.status, u.organizationName || u.email)}
                          style={{
                            backgroundColor: "white",
                            color: u.status === "ACTIVE" ? "rgb(16, 185, 53)" : "rgb(236, 45, 45)",
                            border: u.status === "ACTIVE" ? "1px solid rgb(16, 185, 53)" : "1px solid rgb(214, 15, 15)",
                            fontWeight: "bold",
                            width: "100px",
                            textAlign: "center"
                          }}
                        >
                          {u.status === "ACTIVE" ? "활성화" : "비활성화"}
                        </Button>
                      </div>
                    </td>
                    <td className="text-center">
                      <Button onClick={() => handleFacilityOpen(u.userId, parseInt(u.orgId))}>시설 관리</Button>
                    </td>
                  </tr>
                  {openFacilityUserId === u.userId && (
                    <tr>
                      <td colSpan={7} className="bg-blue-50 p-4">
                        <div className="text-center bg-white rounded-2xl shadow p-4">
                          <div className="flex items-center w-full">
                            <div className="flex-1"></div>
                            <div className="flex-1 text-center">
                              <h4 className="font-semibold mb-3 text-lg">[ 시설 정보 ]</h4>
                            </div>
                            <div className="flex flex-1 justify-end">
                              <button onClick={() => setFacilityOpen(true)} className="py-2 rounded-md w-24 mx-3 border">시설 추가</button>
                            </div>
                          </div>
                          <Modal isOpen={facilityOpen} onClose={() => setFacilityOpen(false)}>
                            <FacilitiesFrom
                              orgId={u.orgId}
                              onSuccess={async () => {
                                setFacilityOpen(false);
                                // 시설 등록 후 목록 새로고침
                                const facilityList = await getFacilities(parseInt(u.orgId));
                                setFacilities(facilityList);
                              }}
                            />
                          </Modal>
                          
                          {/* 시설 수정 모달 */}
                          <Modal isOpen={editFacilityOpen} onClose={() => setEditFacilityOpen(false)}>
                            <UpdateFaForm
                              facility={selectedFacility}
                              onSuccess={async () => {
                                setEditFacilityOpen(false);
                                // 시설 수정 후 목록 새로고침
                                const facilityList = await getFacilities(parseInt(u.orgId));
                                setFacilities(facilityList);
                              }}
                              onClose={() => setEditFacilityOpen(false)}
                            />
                          </Modal>
                          {facilityLoading[u.userId] ? (
                            <div className="text-center py-4">
                              <p>시설 정보를 불러오는 중...</p>
                            </div>
                          ) : (
                            <div>
                              {/* <p className="text-sm text-gray-500 mb-2">디버그: facilities.length = {facilities?.data?.length || facilities?.length || 0}</p>
                              <p className="text-sm text-gray-500 mb-2">디버그: facilities 데이터 = {JSON.stringify(facilities)}</p> */}
                              {(facilities?.data?.length > 0 || facilities?.length > 0) ? (
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="px-4 py-2 text-center">시설명</th>
                                      <th className="px-4 py-2 text-center">위치</th>
                                      {/* <th className="px-4 py-2 text-center">시설 상태</th> */}
                                      <th className="px-4 py-2 text-center">모델번호</th>
                                      <th className="px-4 py-2 text-center">셀 개수</th>
                                      <th className="px-4 py-2 text-center">정격 전력(kW)</th>
                                      <th className="px-4 py-2 text-center">정격 출력(kg/h)</th>
                                      <th className="px-4 py-2 text-center">기준 SEC(kWh/kg)</th>
                                      <th className="px-4 py-2 text-center">촉매 설치일</th>
                                      <th className="px-4 py-2 text-center">작업</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(facilities?.data || facilities || []).map((facility: any, index: number) => (
                                      <tr key={facility.facilityId || index} className="border-b">
                                        <td className="px-4 py-2">{facility.name || 'N/A'}</td>
                                        <td className="px-4 py-2">{facility.location || 'N/A'}</td>
                                        {/* <td className="px-4 py-2">{facility.status || 'N/A'}</td> */}
                                        <td className="px-4 py-2">{facility.modelNo || 'N/A'}</td>
                                        <td className="px-4 py-2">{facility.cellCount || 'N/A'}</td>
                                        <td className="px-4 py-2">{facility.ratedPowerKw || 'N/A'}</td>
                                        <td className="px-4 py-2">{facility.ratedOutputKgH || 'N/A'}</td>
                                        <td className="px-4 py-2">{facility.secNominalKwhPerKg || 'N/A'}</td>
                                        <td className="px-4 py-2">{facility.catalystInstallDate || 'N/A'}</td>
                                        <td className="px-4 py-2 text-center">
                                          <Button 
                                            onClick={() => {
                                              setSelectedFacility(facility);
                                              setEditFacilityOpen(true);
                                            }}
                                            style={{ backgroundColor: "#3b82f6", color: "white", fontSize: "12px", padding: "4px 8px", marginRight: "8px" }}
                                          >
                                            편집
                                          </Button>
                                          <Button style={{ backgroundColor: "#ef4444", color: "white", fontSize: "12px", padding: "4px 8px" }}>
                                            삭제
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p>등록된 시설이 없습니다.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}