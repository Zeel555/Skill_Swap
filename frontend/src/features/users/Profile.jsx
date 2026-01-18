import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getProfile, getUserHistory, getUserDashboard } from "./userSlice";
import { calculateProfileCompletion } from "../../utils/profileCompletion";
import UserRatings from "../ratings/UserRatings";
import Loader from "../../components/Loader";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, history, dashboard, loading } = useSelector((state) => state.user);
  const [showHistory, setShowHistory] = useState(false);

  const profileCompletion = profile
    ? calculateProfileCompletion(profile, dashboard?.completedSwaps || 0)
    : { percentage: 0, missingSteps: [] };

  useEffect(() => {
    dispatch(getProfile());
    dispatch(getUserDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (showHistory) {
      dispatch(getUserHistory());
    }
  }, [dispatch, showHistory]);

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <Link
          to="/profile/edit"
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Basic Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-800">
                {profile.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-800">
                {profile.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-semibold text-gray-800">
                {profile.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Profile Completion</p>
              <div className="mt-1">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${profileCompletion.percentage}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-sm font-semibold text-blue-600">
                  {profileCompletion.percentage}%
                </p>
              </div>
              {profileCompletion.missingSteps.length > 0 && (
                <div className="mt-2 space-y-1">
                  {profileCompletion.missingSteps.map((step, idx) => (
                    <p key={idx} className="text-xs text-gray-500">
                      {step.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
            {profile.avgRating > 0 && (
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-lg font-semibold text-yellow-600">
                  ⭐ {profile.avgRating.toFixed(1)} / 5.0
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Bio</h2>
          {profile.bio ? (
            <p className="text-gray-700">{profile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">No bio added yet</p>
          )}
        </div>

        {/* User Ratings */}
        <div className="col-span-2">
          <UserRatings userId={profile._id} />
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Skills Offered
          </h2>
          {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skillsOffered.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills offered yet</p>
          )}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Skills Wanted
          </h2>
          {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skillsWanted.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills wanted yet</p>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">My History</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            {showHistory ? "Hide History" : "Show History"}
          </button>
        </div>

        {showHistory && (
          <div className="rounded-lg border bg-white p-6 shadow">
            {loading ? (
              <Loader />
            ) : history.length === 0 ? (
              <p className="text-gray-500">No swap history yet</p>
            ) : (
              <div className="space-y-4">
                {history.map((swap) => (
                  <div key={swap._id} className="rounded border p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          {swap.sender?._id === profile._id
                            ? `You → ${swap.receiver?.name}`
                            : `${swap.sender?.name} → You`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {swap.skillOffered} ↔ {swap.skillRequested}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(swap.createdAt).toLocaleString()}
                        </p>
                      </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

