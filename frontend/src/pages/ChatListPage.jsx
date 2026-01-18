import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMySwaps } from "../features/swaps/swapSlice";
import { getProfile } from "../features/users/userSlice";

const ChatListPage = () => {
  const dispatch = useDispatch();
  const { swaps } = useSelector((state) => state.swap);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMySwaps());
  }, [dispatch]);

  // Get unique users from swaps
  const chatUsers = swaps.reduce((acc, swap) => {
    const otherUserId =
      swap.sender?._id === user?._id
        ? swap.receiver?._id
        : swap.sender?._id;
    const otherUserName =
      swap.sender?._id === user?._id
        ? swap.receiver?.name
        : swap.sender?.name;

    if (otherUserId && !acc.find((u) => u._id === otherUserId)) {
      acc.push({ _id: otherUserId, name: otherUserName });
    }
    return acc;
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Chats</h1>

      {chatUsers.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow">
          <p className="text-gray-600">
            No chats yet. Start a swap to begin chatting!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chatUsers.map((chatUser) => (
            <Link
              key={chatUser._id}
              to={`/chat/${chatUser._id}`}
              className="block rounded-lg border bg-white p-4 shadow hover:bg-gray-50"
            >
              <p className="font-semibold text-gray-800">{chatUser.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatListPage;

