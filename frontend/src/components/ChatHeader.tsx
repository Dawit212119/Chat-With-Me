import { X } from "lucide-react";
import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUser } = useAuthStore();
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser?.userPic} alt={selectedUser?.fullname} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser?.fullname}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUser.includes(selectedUser?._id as string)
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
