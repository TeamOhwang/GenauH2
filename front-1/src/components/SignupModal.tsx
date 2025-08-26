import { useState, FormEvent } from "react";
import { useSignup } from "@/hooks/useSignup";
import type { FacilityReq, RegisterReq } from "@/api/authApi";

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
      name: "",
      location: "",
      modelNo: "",
      cellCount: "",
      ratedPowerKw: "",
      ratedOutputKgH: "",
      secNominalKwhPerKg: "",
      catalystInstallDate: "",
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
        location: "",
        modelNo: "",
        cellCount: "",
        ratedPowerKw: "",
        ratedOutputKgH: "",
        secNominalKwhPerKg: "",
        catalystInstallDate: "",
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

    // 사업자 인증 체크
    if (!bizVerified) {
      alert("사업자등록번호 확인 후 진행해주세요.");
      return;
    }

    const ok = await submit({ ...userInfo, facilities });
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">회원가입</h2>

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
              <div key={idx} className="border p-4 mb-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <input
                    type="text"
                    placeholder="위치"
                    value={f.location}
                    onChange={(e) => {
                      const copy = [...facilities];
                      copy[idx].location = e.target.value;
                      setFacilities(copy);
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="모델번호"
                    value={f.modelNo}
                    onChange={(e) => {
                      const copy = [...facilities];
                      copy[idx].modelNo = e.target.value;
                      setFacilities(copy);
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="셀 개수"
                    value={f.cellCount}
                    onChange={(e) => {
                      const copy = [...facilities];
                      copy[idx].cellCount = e.target.value;
                      setFacilities(copy);
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="정격 전력"
                    value={f.ratedPowerKw}
                    onChange={(e) => {
                      const copy = [...facilities];
                      copy[idx].ratedPowerKw = e.target.value;
                      setFacilities(copy);
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="정격 출력"
                    value={f.ratedOutputKgH}
                    onChange={(e) => {
                      const copy = [...facilities];
                      copy[idx].ratedOutputKgH = e.target.value;
                      setFacilities(copy);
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="기준 SEC"
                    value={f.secNominalKwhPerKg}
                    onChange={(e) => {
                      const copy = [...facilities];
                      copy[idx].secNominalKwhPerKg = e.target.value;
                      setFacilities(copy);
                    }}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="촉매 설치일"
                    value={f.catalystInstallDate}
                    onChange={(e) => {
                      const copy = [...facilities];
                      copy[idx].catalystInstallDate = e.target.value;
                      setFacilities(copy);
                    }}
                    className="border rounded px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFacility(idx)}
                  className="text-red-500 text-sm mt-2 hover:underline"
                >
                  삭제
                </button>
              </div>
            ))}
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
      </div>
    </div>
  );
}
