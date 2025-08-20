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

  const { getUsers, loading, error } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"활성화" | "비활성화" | "전체">("전체");

  useEffect(() => {
    getUsers().then(setUsers);
  }, [getUsers])

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류: {error}</p>;

  // const filteredUsers = users.filter(u =>
  // (statusFilter === "전체" || u.status === statusFilter) 
  // // (u.email.includes(search) || u.group.includes(search))
  // )

  return (
    <div className="h-full p-6">
      <div className="flex ">
        <p className="text-2xl font-bold mb-6">관리자 페이지</p>
        <Button onClick={() => setIsOpen(true)} className="mx-3 bg-blue-600">회원 추가</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          회원 등록
          <RegiFrom />
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



      <div className="flex flex-col h-2/3 w-full bg-white rounded-2xl shadow overflow-y-scroll p-3">
        {/* 검색  + 필터 */}
        <div className="flex mb-4">
          <Input
            placeholder="검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-1/3 rounded-3xl bg-gray-200"
          />
          <Select onValueChange={(val) => setStatusFilter(val as any)} defaultValue="전체">
            <SelectTrigger className="w-[120px] rounded-3xl mx-3">
              <SelectValue placeholder="계정 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="ACTIVE">활성화</SelectItem>
              <SelectItem value="SUSPENDED">비활성화</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 테이블 */}
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">소속</th>
              <th className="text-left">이메일(ID)</th>
              <th className="text-left">이름</th>
              <th className="text-left">최근 로그인</th>
              <th className="text-center">역할</th>
              <th className="text-center">계정 상태</th>
              <th className="text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <>
                <tr key={u.userId}>
                  <td>{u.orgname}</td>
                  <td>{u.email}</td>
                  <td>{u.organizationName}</td>
                  <td>{u.userUpdatedAt.split("T")[0]}</td>
                  <td className="text-center">{u.role}</td>
                  <td className="text-center"><Button>{u.status}</Button></td>
                  <td className="text-center"><Button>시설 관리</Button></td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}