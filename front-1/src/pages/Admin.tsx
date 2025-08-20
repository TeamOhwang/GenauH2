import Modal from "@/components/ui/Modal";
import RegiFrom from "@/components/UserRegiForm";
import { useAdmin } from "@/hooks/useAdmin";
import { useEffect, useState } from "react";

export default function Admin() {

  const [isOpen, setIsOpen] = useState(false);

  const { getUsers, loading, error } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, [getUsers])

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div className="h-full p-6">
      <div className="flex ">
        <p className="text-2xl font-bold mb-6">관리자 페이지</p>
        <button className="mr-6 bg-blue-500 text-white px-4 rounded-lg h-2/3" onClick={() => setIsOpen(true)}>회원 추가</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          회원 등록
          <RegiFrom />
        </Modal>
      </div>
      {/* 요약 통계 */}
      <div>
        <div></div>
      </div>
      <div className="flex justify-between mb-3 items-center bg-white h-10 rounded-xl shadow">
        <div className="ml-3 w-1/3 h-2/3 bg-gray-200 rounded-3xl">검색</div>
      </div>
      <div className="flex flex-col h-2/3 w-full bg-white rounded-2xl shadow overflow-y-scroll p-3">
        회원정보
        <table className="border-separate">
          <thead>
            <tr>
              <th>소속</th>
              <th>이메일(ID)</th>
              <th>이름</th>
              <th>최근 로그인</th>
              <th>역할</th>
              <th>계정 상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <>
                <tr key={u.userId}>
                  <td>회사명</td>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                  <td><button className="bg-blue-100">변경</button></td>
                </tr>
                <tr className="border-style: solid">드롭다운</tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}