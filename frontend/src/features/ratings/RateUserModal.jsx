import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { rateUser } from "./ratingThunks";
import { clearError, clearSuccess } from "./ratingSlice";

const RateUserModal = ({ swapId, ratedUserId, swapStatus, onClose, currentUserId }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.rating);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  // Prevent self-rating
  useEffect(() => {
    if (currentUserId === ratedUserId) {
      onClose?.();
    }
  }, [currentUserId, ratedUserId, onClose]);

  // Only allow rating if swap is completed
  if (swapStatus !== "completed") {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5");
      return;
    }

    if (currentUserId === ratedUserId) {
      alert("You cannot rate yourself");
      return;
    }

    try {
      await dispatch(rateUser({ 
        swapId, 
        ratedUserId, 
        rating, 
        comment: review // Backend uses 'comment' field
      })).unwrap();
      
      setTimeout(() => {
        dispatch(clearSuccess());
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      // Error handled by state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Rate User</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-800">
            Rating submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rating (1-5 stars):
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-all hover:scale-110 ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {rating} {rating === 1 ? "star" : "stars"}
              </p>
            )}
          </div>

          {/* Review Text Area */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Review (optional):
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Share your experience..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateUserModal;

