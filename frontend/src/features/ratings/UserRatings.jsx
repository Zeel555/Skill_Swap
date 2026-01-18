import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserRatings } from "./ratingThunks";
import Loader from "../../components/Loader";

const UserRatings = ({ userId }) => {
  const dispatch = useDispatch();
  const { userRatings, loadingRatings } = useSelector((state) => state.rating);

  useEffect(() => {
    if (userId) {
      dispatch(getUserRatings(userId));
    }
  }, [dispatch, userId]);

  if (loadingRatings) {
    return <Loader />;
  }

  if (!userRatings) {
    return null;
  }

  const { avgRating, reviews } = userRatings;

  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Ratings & Reviews</h2>

      {/* Average Rating */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-800">
            {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
          </div>
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-2xl ${
                  star <= Math.round(avgRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded bg-gray-50 p-4 text-center text-gray-500">
          No reviews yet
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-800">
                    {review.ratedBy?.name || "Anonymous"}
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {review.rating}/5
                </span>
              </div>
              {review.review && (
                <p className="text-sm text-gray-700">{review.review}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRatings;

