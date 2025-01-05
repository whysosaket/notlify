import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { CiLogout, CiSaveDown1 } from "react-icons/ci";
import { CiCircleRemove } from "react-icons/ci";
import { CiCircleInfo } from "react-icons/ci";
import { CiExport } from "react-icons/ci";
import { MdKeyboardCommandKey } from "react-icons/md";
import { useAuthenticate } from "../hooks/useAuthenticate";
import { useNavigate } from "react-router-dom";

interface BreadCrumbMenuProps {
  isBreadCrumbOpen: boolean;
  setIsBreadCrumbOpen: Dispatch<SetStateAction<boolean>>;
  handleDelete: () => void;
  handleSave: () => void;
}

const BreadCrumbMenu = ({ isBreadCrumbOpen, setIsBreadCrumbOpen, handleDelete, handleSave }: BreadCrumbMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {logout} = useAuthenticate();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsBreadCrumbOpen(false);
      }
    };

    if (isBreadCrumbOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBreadCrumbOpen, setIsBreadCrumbOpen]);

  return (
    <div className="absolute right-4 top-12 z-50" ref={menuRef}>
      {isBreadCrumbOpen && (
        <div className="w-[200px] breadcrumb-box bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
          <ul className="space-y-2">
            <li>
              <button className="flex items-center space-x-2" onClick={handleSave}>
                <CiSaveDown1 size={20} />
                <span>Save Notes</span>
              </button>
            </li>
            <li>
              <button className="flex items-center space-x-2" onClick={handleDelete}>
                <CiCircleRemove size={20} />
                <span>Delete Notes</span>
              </button>
            </li>
            <li>
              <button className="flex items-center space-x-2">
                <CiExport size={20} />
                <span>Export</span>
              </button>
              <hr className="mt-2 px-4" />
            </li>
            <li>
              <button className="flex items-center space-x-2" onClick={handleLogout}>
                <CiLogout size={20} />
                <span>Logout</span>
              </button>
              <hr className="mt-2 px-4" />
            </li>
            <li>
              <h1 className="font-semibold">Info</h1>
            </li>
            <li className="text-neutral-600">
              <div className="flex items-center space-x-2">
                <CiCircleInfo size={20} />
                <span className="text-sm">Generate Notes</span>
              </div>
              <div className="text-xs pl-7 flex justify-start align-middle">
              <span className="font-mono tracking-[-2px] font-light">ctrl + <span className="font-semibold">G</span> <strong className="font-medium">or</strong></span> 
              <span className="flex"><MdKeyboardCommandKey className="my-auto mx-1" /> + <span className="font-semibold mx-1">G</span></span>
              </div>
            </li>
            <li className="text-neutral-600">
              <div className="flex items-center space-x-2">
                <CiCircleInfo size={20} />
                <span className="text-sm">Auto Complete</span>
              </div>
              <div className="text-xs pl-7 flex justify-start align-middle">
              <span className="font-mono tracking-[-2px] font-light">ctrl + <span className="font-semibold">K</span> <strong className="font-medium">or</strong></span> 
              <span className="flex"><MdKeyboardCommandKey className="my-auto mx-1" /> + <span className="font-semibold mx-1">K</span></span>
              </div>
            </li>
            <li className="text-neutral-600">
              <div className="flex items-center space-x-2">
                <CiCircleInfo size={20} />
                <span className="text-sm">Fix Errors</span>
              </div>
              <div className="text-xs pl-7 flex justify-start align-middle">
              <span className="font-mono tracking-[-2px] font-light">ctrl + <span className="font-semibold">L</span> <strong className="font-medium">or</strong></span> 
              <span className="flex"><MdKeyboardCommandKey className="my-auto mx-1" /> + <span className="font-semibold mx-1">L</span></span>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BreadCrumbMenu;
