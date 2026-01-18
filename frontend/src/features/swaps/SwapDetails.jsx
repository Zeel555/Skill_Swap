import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import ReportModal from "../../components/ReportModal";
import RateUserModal from "../ratings/RateUserModal";
import { getMySwaps, updateSwapStatus } from "./swapSlice";

const SwapDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { swaps, loading } = useSelector((state) => state.swap);
  const { user } = useSelector((state) => state.auth);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    dispatch(getMySwaps());
  }, [dispatch]);

  const swap = swaps.find((s) => s._id === id);

  if (loading) {
    return <Loader />;
  }

  if (!swap) {
    return (
      <div>
        <p>Swap not found</p>
        <button onClick={() => navigate("/swaps")}>Back to Swaps</button>
      </div>
    );
  }

  const isReceiver = swap.receiver?._id === user?._id;
  const otherUser = isReceiver ? swap.sender : swap.receiver;

  const handleStatusUpdate = async (status) => {
    await dispatch(updateSwapStatus({ swapId: swap._id, status }));
    dispatch(getMySwaps());
  };

  const handleReportUser = () => {
    setReportTarget({
      type: "user",
      id: otherUser._id,
      name: otherUser.name
    });
    setShowReportModal(true);
  };

  const handleReportSwap = () => {
    setReportTarget({
      type: "swap",
      id: swap._id,
      name: `Swap with ${otherUser.name}`
    });
    setShowReportModal(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Swap Details</h1>
        <button
          onClick={() => navigate("/swaps")}
          className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Swap Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block rounded px-2 py-1 text-sm font-semibold ${
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
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-semibold text-gray-800">
                {new Date(swap.createdAt).toLocaleString()}
              </p>
            </div>
            {swap.updatedAt && (
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-800">
                  {new Date(swap.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={handleReportSwap}
                className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                🚨 Report Swap
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Other User
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-gray-800">
                {otherUser?.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">
                {otherUser?.email || "N/A"}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleReportUser}
                className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                🚨 Report User
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Skills Exchange
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">You Offer</p>
              <p className="font-semibold text-gray-800">
                {isReceiver ? swap.skillRequested : swap.skillOffered}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">You Receive</p>
              <p className="font-semibold text-gray-800">
                {isReceiver ? swap.skillOffered : swap.skillRequested}
              </p>
            </div>
          </div>
        </div>

        {isReceiver && swap.status === "pending" && (
          <div className="rounded-lg border bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Actions
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleStatusUpdate("accepted")}
                className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
              >
                Accept Swap
              </button>
              <button
                onClick={() => handleStatusUpdate("rejected")}
                className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
              >
                Reject Swap
              </button>
            </div>
          </div>
        )}

        {swap.status === "accepted" && (
          <div className="rounded-lg border bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Actions
            </h2>
            <button
              onClick={() => handleStatusUpdate("completed")}
              className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Mark as Completed
            </button>
          </div>
        )}

        {/* Rating Section - Only show if swap is completed and user is not rating themselves */}
        {swap.status === "completed" && otherUser?._id !== user?._id && (
          <div className="rounded-lg border bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Rate {otherUser?.name || "User"}
            </h2>
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full rounded bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700"
            >
              ⭐ Rate User
            </button>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RateUserModal
          swapId={swap._id}
          ratedUserId={otherUser?._id}
          swapStatus={swap.status}
          currentUserId={user?._id}
          onClose={() => {
            setShowRatingModal(false);
            dispatch(getMySwaps()); // Refresh to update if rating was successful
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && reportTarget && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
        />
      )}
    </div>
  );
};

export default SwapDetails;

