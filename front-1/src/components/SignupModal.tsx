import { useState, FormEvent } from "react";
import { useSignup } from "@/hooks/useSignup";
import type { FacilityReq, RegisterReq } from "@/api/authApi";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

type Props = { onClose: () => void };

export default function SignupModal({ onClose }: Props) {
  const { submit, validateBiz, loading, error } = useSignup();

  // 사용자 정보 상태
   const [userInfo, setUserInfo] = useState<Omit<RegisterReq, "facilities">>({
    email: "",
    rawPassword: "",
    orgName: "",
    ownerName: "",
    bizRegNo: "",
    phoneNum: "",
  });

  // 설비 정보 상태
  const [facilities, setFacilities] = useState<FacilityReq[]>([
    {
  name: "",                       // 시설명
  type: "PEM",                    // 전해조 타입 (Enum)
  maker: "",                      // 제조사 (선택)
  model: "",                      // 모델명 (선택)
  powerKw: "",                     // 정격 전력 (kW)
  h2Rate: "",                      // 정격 수소 생산량 (kg/h)
  specKwh: "",                     // 특정 소비전력 (kWh/kg)
  purity: "",                      // 수소 순도 (%) (선택)
  pressure: "",                    // 인출 압력 (bar) (선택)
  location: "",                   // 설치 위치 (선택)
  install: "",                    // 설치일자 (YYYY-MM-DD, 선택)
    },
  ]);

  // 사업자 인증 상태
  const [bizVerified, setBizVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);


  const addFacility = () =>
    setFacilities([
      ...facilities,
      {
      name: "",                       
      type: "PEM",                   
      maker: "",                     
      model: "",                      
      powerKw: "",                    
      h2Rate: "",                      
      specKwh: "",                   
      purity: "",                      
      pressure: "",                   
      location: "",                  
      install: "",        
      },
    ]);

 const removeFacility = (idx: number) =>
    setFacilities(facilities.filter((_, i) => i !== idx));


  //  사업자번호 검증
  const handleValidateBiz = async () => {
    if (!userInfo.bizRegNo) {
      alert("사업자등록번호를 입력해주세요.");
      return;
    }
    try {
      setVerifying(true);
      const ok = await validateBiz(userInfo.bizRegNo);
      console.log(ok);
      if (ok) {
        alert("사업자등록번호 확인 완료");
        setBizVerified(true);
      } else {
        alert("유효하지 않은 사업자등록번호입니다.");
        setBizVerified(false);
      }
    } catch {
      alert("검증 중 오류가 발생했습니다.");
      setBizVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  // 회원가입 요청
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    // 비밀번호 길이 체크
    if (userInfo.rawPassword.length < 8) {
      alert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    // 전화번호 필수 체크
    if (!userInfo.phoneNum || userInfo.phoneNum.trim() === "") {
      alert("전화번호를 입력해주세요.");
      return;
    }

    // 사업자 인증 체크
    if (!bizVerified) {
      alert("사업자등록번호 확인 후 진행해주세요.");
      return;
    }

    const ok = await submit({ ...userInfo, facilities });
    if (ok) onClose();
  };

  return (
  <Dialog open={true} onClose={onClose} className="relative z-50">
    {/* 오버레이 */}
    <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

    {/* 모달 컨테이너 */}
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 
                               max-h-[90vh] overflow-y-auto rounded-lg p-6">
        {/* 제목 */}
        <DialogTitle className="text-xl font-bold mb-6">회원가입</DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 사용자 정보 */}
          <fieldset className="border rounded p-4">
            <legend className="font-semibold px-2">사용자 정보</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="이메일 (예: user@example.com)"
                value={userInfo.email}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, email: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="비밀번호 (8자 이상)"
                value={userInfo.rawPassword}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, rawPassword: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="회사명"
                value={userInfo.orgName}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, orgName: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="대표자명"
                value={userInfo.ownerName}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, ownerName: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="tel"
                placeholder="전화번호 (예: 01012345678)"
                value={userInfo.phoneNum}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, phoneNum: e.target.value })
                }
                className="border rounded px-3 py-2"
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="사업자 등록번호"
                  value={userInfo.bizRegNo}
                  onChange={(e) => {
                    setUserInfo({ ...userInfo, bizRegNo: e.target.value });
                    setBizVerified(false); // 번호 변경 시 다시 확인 필요
                  }}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleValidateBiz}
                  disabled={verifying}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {verifying ? "확인 중..." : "사업자확인"}
                </button>
              </div>
            </div>
          </fieldset>

              {/* 설비 등록 */}
              <fieldset className="border rounded p-4">
                <legend className="font-semibold px-2">설비 등록</legend>
                {facilities.map((f, idx) => (
                  <div key={idx} className="border p-4 mb-4 rounded-lg relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* 시설명 */}
                      <input
                        type="text"
                        placeholder="시설명"
                        value={f.name}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].name = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 전해조 타입 */}
                      <select
                        value={f.type}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].type = e.target.value as "PEM" | "ALK" | "SOEC";
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      >
                        <option value="PEM">PEM</option>
                        <option value="ALK">ALK</option>
                        <option value="SOEC">SOEC</option>
                      </select>

                      {/* 제조사 */}
                      <input
                        type="text"
                        placeholder="제조사"
                        value={f.maker ?? ""}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].maker = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 모델명 */}
                      <input
                        type="text"
                        placeholder="모델명"
                        value={f.model ?? ""}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].model = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 정격 전력 */}
                      <input
                        type="text"
                        placeholder="정격 전력 (kW)"
                        value={f.powerKw}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].powerKw = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 정격 수소 생산량 */}
                      <input
                        type="text"
                        placeholder="정격 수소 생산량 (kg/h)"
                        value={f.h2Rate}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].h2Rate = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 특정 소비전력 */}
                      <input
                        type="text"
                        placeholder="특정 소비전력 (kWh/kg)"
                        value={f.specKwh}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].specKwh = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 수소 순도 */}
                      <input
                        type="text"
                        placeholder="수소 순도 (%)"
                        value={f.purity ?? ""}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].purity = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 인출 압력 */}
                      <input
                        type="text"
                        placeholder="인출 압력 (bar)"
                        value={f.pressure ?? ""}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].pressure = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 설치 위치 */}
                      <input
                        type="text"
                        placeholder="설치 위치"
                        value={f.location ?? ""}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].location = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />

                      {/* 설치일자 */}
                      <input
                        type="date"
                        placeholder="설치일자"
                        value={f.install ?? ""}
                        onChange={(e) => {
                          const copy = [...facilities];
                          copy[idx].install = e.target.value;
                          setFacilities(copy);
                        }}
                        className="border rounded px-3 py-2"
                      />
                    </div>
                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => removeFacility(idx)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                ))}

                {/* 설비 추가 버튼 */}
                <button
                  type="button"
                  onClick={addFacility}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  + 설비 추가
                </button>
              </fieldset>


          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!bizVerified || loading}
              className={`px-4 py-2 rounded text-white ${
                bizVerified ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
              }`}
            >
              {loading ? "가입 중..." : "회원가입 완료"}
            </button>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </DialogPanel>
    </div>
  </Dialog>
);
}