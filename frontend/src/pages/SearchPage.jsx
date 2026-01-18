import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ReportModal from "../components/ReportModal";
import { searchUsers } from "../features/users/userSlice";
import { useDebounce } from "../hooks/useDebounce";

const SearchPage = () => {
  const dispatch = useDispatch();
  const { searchResults, loading } = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    if (debouncedSearch) {
      dispatch(searchUsers(debouncedSearch));
    }
  }, [debouncedSearch, dispatch]);

  const handleReportUser = (user) => {
    setReportTarget({
      type: "user",
      id: user._id,
      name: user.name
    });
    setShowReportModal(true);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Search Users</h1>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by skill..."
          className="w-full max-w-md rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : searchResults.length === 0 && searchQuery ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow">
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((user) => (
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
                  Skills Offered:
                </p>
                <div className="flex flex-wrap gap-1">
                  {user.skillsOffered?.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
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

export default SearchPage;

