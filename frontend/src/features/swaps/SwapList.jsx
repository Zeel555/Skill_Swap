import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMySwaps, updateSwapStatus } from "./swapSlice";
import RateUserModal from "../ratings/RateUserModal";
import Loader from "../../components/Loader";

const SwapList = () => {
  const dispatch = useDispatch();
  const { swaps, loading } = useSelector((state) => state.swap);
  const { user } = useSelector((state) => state.auth);
  const [ratingModal, setRatingModal] = useState({ show: false, swap: null, otherUser: null });

  useEffect(() => {
    dispatch(getMySwaps());
  }, [dispatch]);

  const handleStatusUpdate = async (swapId, status) => {
    await dispatch(updateSwapStatus({ swapId, status }));
    dispatch(getMySwaps());
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Swaps</h1>
        <Link
          to="/swaps/create"
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Create Swap
        </Link>
      </div>

      {swaps.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow">
          <p className="mb-4 text-gray-600">No swaps yet</p>
          <Link
            to="/swaps/create"
            className="text-blue-600 hover:underline"
          >
            Create your first swap →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {swaps.map((swap) => {
            const isReceiver = swap.receiver?._id === user?._id;
            const otherUser = isReceiver ? swap.sender : swap.receiver;

            return (
              <div
                key={swap._id}
                className="rounded-lg border bg-white p-6 shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {otherUser?.name || "Unknown User"}
                      </h3>
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          swap.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : swap.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : swap.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {swap.status}
                      </span>
                    </div>

                    <div className="mb-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">You offer:</span>{" "}
                        {isReceiver ? swap.skillRequested : swap.skillOffered}
                      </p>
                      <p>
                        <span className="font-semibold">You receive:</span>{" "}
                        {isReceiver ? swap.skillOffered : swap.skillRequested}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500">
                      Created: {new Date(swap.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {isReceiver && swap.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(swap._id, "accepted")}
                          className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(swap._id, "rejected")}
                          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {swap.status === "accepted" && (
                      <button
                        onClick={() => handleStatusUpdate(swap._id, "completed")}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    {swap.status === "completed" && otherUser?._id !== user?._id && (
                      <button
                        onClick={() => setRatingModal({ show: true, swap, otherUser })}
                        className="rounded bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700"
                      >
                        ⭐ Rate
                      </button>
                    )}
                    <Link
                      to={`/swaps/${swap._id}`}
                      className="rounded border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal.show && ratingModal.swap && (
        <RateUserModal
          swapId={ratingModal.swap._id}
          ratedUserId={ratingModal.otherUser?._id}
          swapStatus={ratingModal.swap.status}
          currentUserId={user?._id}
          onClose={() => {
            setRatingModal({ show: false, swap: null, otherUser: null });
            dispatch(getMySwaps()); // Refresh swaps
          }}
        />
      )}
    </div>
  );
};

export default SwapList;

