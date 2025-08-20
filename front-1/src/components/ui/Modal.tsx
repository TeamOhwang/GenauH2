import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    width?: string; // 넓이 : Tailwind 클래스 or px 단위
    maxHeight?: string; // 최대 높이 : Tailwind 클래스 or px 단위
    minHeight?: string; // 최소 높이 : Tailwind 클래스 or px 단위
}

const Modal = ({
    isOpen,
    onClose,
    children,
    width = "w-[400px]",
    maxHeight = "max-h-[80vh]",
    minHeight = "min-h-[40vh]",
}: ModalProps) => {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        }
    }, [isOpen])

    if (!isOpen) return null

    return createPortal(
        <div className='fixed inset-0 flex items-center justify-center z-50'>
            {/* 배경 */}
            <div
                className='absolute inset-0 bg-black/50 backdrop-blur-sm'
                onClick={onClose}
            ></div>

            {/* 모달 박스 */}
            <div 
                className={`relative bg-white rounded-2xl shadow overflow-y-auto p-6 z-10 ${width} ${maxHeight} ${minHeight}`}
            >
                {/* 닫기 버튼 */}
                <button
                    className='absolute top-3 right-3 text-gray-500 hover:text-gray-800'
                    onClick={onClose}
                >
                    ✕
                </button>

                {children}
            </div>
        </div>, 
        document.body
    )
}

export default Modal