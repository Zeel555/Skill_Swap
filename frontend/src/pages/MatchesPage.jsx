import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import ReportModal from "../components/ReportModal";
import { getMatchedUsers } from "../features/users/userSlice";

const MatchesPage = () => {
  const dispatch = useDispatch();
  const { matchedUsers, loading } = useSelector((state) => state.user);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    dispatch(getMatchedUsers());
  }, [dispatch]);

  const handleReportUser = (user) => {
    setReportTarget({
      type: "user",
      id: user._id,
      name: user.name
    });
    setShowReportModal(true);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Skill Matches</h1>

      {matchedUsers.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow">
          <p className="text-gray-600">No matches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matchedUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-lg border bg-white p-6 shadow"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                {user.name}
              </h3>
              <p className="mb-2 text-sm text-gray-600">{user.email}</p>
              <div className="mb-4">
                <p className="mb-1 text-sm font-semibold text-gray-700">
                  Matching Skills:
                </p>
                <div className="flex flex-wrap gap-1">
                  {user.matchingSkills?.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/swaps/create?userId=${user._id}`}
                  className="flex-1 rounded bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create Swap
                </Link>
                <button
                  onClick={() => handleReportUser(user)}
                  className="rounded bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                  title="Report this user"
                >
                  🚨
                </button>
              </div>
            </div>
          ))}
        </div>
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

export default MatchesPage;

