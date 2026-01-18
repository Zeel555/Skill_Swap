import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createSwap } from "./swapSlice";
import { searchUsers } from "../users/userSlice";
import { useDebounce } from "../../hooks/useDebounce";

const CreateSwap = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.swap);
  const { searchResults } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    receiverId: "",
    skillOffered: "",
    skillRequested: ""
  });

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearch) {
      dispatch(searchUsers(debouncedSearch));
    }
  }, [debouncedSearch, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createSwap(form));
    if (createSwap.fulfilled.match(result)) {
      navigate("/swaps");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Create Swap</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Search User by Skill
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a skill to find users..."
            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded border bg-white p-2">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, receiverId: user._id });
                    setSearchQuery("");
                  }}
                  className="w-full rounded p-2 text-left hover:bg-gray-100"
                >
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">
                    Skills: {user.skillsOffered?.join(", ") || "None"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {form.receiverId && (
          <>
            <div className="rounded-lg border bg-white p-6 shadow">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Skill You're Offering
              </label>
              <input
                type="text"
                name="skillOffered"
                value={form.skillOffered}
                onChange={handleChange}
                placeholder="e.g., JavaScript, Cooking, Photography"
                className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="rounded-lg border bg-white p-6 shadow">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Skill You're Requesting
              </label>
              <input
                type="text"
                name="skillRequested"
                value={form.skillRequested}
                onChange={handleChange}
                placeholder="e.g., Python, Guitar, Design"
                className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !form.receiverId}
            className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Swap"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/swaps")}
            className="rounded border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSwap;

