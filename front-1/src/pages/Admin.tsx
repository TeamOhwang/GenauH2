export default function Admin() {


  return (
    <div className="h-full p-6">
      <p className="text-2xl font-bold mb-6">관리자 페이지</p>
      <div className="flex justify-between mb-3 items-center bg-white h-10 rounded-xl shadow">
        <div className="ml-3 w-1/3 h-2/3 bg-gray-200 rounded-3xl">검색</div>
        <div className="mr-6">회원 추가</div>
      </div>
      <div className="flex flex-col h-2/3 w-full bg-white rounded-2xl shadow">
        회원정보
      </div>
    </div>
  );
}