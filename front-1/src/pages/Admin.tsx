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
      <p className="text-2xl font-bold mb-6">관리자 페이지</p>
      <div className="flex justify-between mb-3 items-center bg-white h-10 rounded-xl shadow">
        <div className="ml-3 w-1/3 h-2/3 bg-gray-200 rounded-3xl">검색</div>
        <button className="mr-6 bg-blue-500 text-white px-4 rounded-lg h-2/3" onClick={() => setIsOpen(true)}>회원 추가</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          회원 등록
          <RegiFrom/>
        </Modal>
      </div>
      <div className="flex flex-col h-2/3 w-full bg-white rounded-2xl shadow">
        회원정보
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>이름</th>
              <th>역할</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}