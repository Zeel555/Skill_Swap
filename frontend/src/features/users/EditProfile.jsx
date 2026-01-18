import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "./userSlice";
import Loader from "../../components/Loader";

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    skillsOffered: [],
    skillsWanted: []
  });

  const [skillOfferedInput, setSkillOfferedInput] = useState("");
  const [skillWantedInput, setSkillWantedInput] = useState("");

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        bio: profile.bio || "",
        skillsOffered: profile.skillsOffered || [],
        skillsWanted: profile.skillsWanted || []
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkillOffered = () => {
    if (skillOfferedInput.trim() && !form.skillsOffered.includes(skillOfferedInput.trim())) {
      setForm({
        ...form,
        skillsOffered: [...form.skillsOffered, skillOfferedInput.trim()]
      });
      setSkillOfferedInput("");
    }
  };

  const removeSkillOffered = (skill) => {
    setForm({
      ...form,
      skillsOffered: form.skillsOffered.filter((s) => s !== skill)
    });
  };

  const addSkillWanted = () => {
    if (skillWantedInput.trim() && !form.skillsWanted.includes(skillWantedInput.trim())) {
      setForm({
        ...form,
        skillsWanted: [...form.skillsWanted, skillWantedInput.trim()]
      });
      setSkillWantedInput("");
    }
  };

  const removeSkillWanted = (skill) => {
    setForm({
      ...form,
      skillsWanted: form.skillsWanted.filter((s) => s !== skill)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      navigate("/profile");
    }
  };

  if (loading && !profile) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Tell others about yourself..."
          />
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Skills Offered
          </label>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={skillOfferedInput}
              onChange={(e) => setSkillOfferedInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkillOffered();
                }
              }}
              placeholder="Add a skill"
              className="flex-1 rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addSkillOffered}
              className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skillsOffered.map((skill, index) => (
              <span
                key={index}
                className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkillOffered(skill)}
                  className="text-green-800 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Skills Wanted
          </label>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={skillWantedInput}
              onChange={(e) => setSkillWantedInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkillWanted();
                }
              }}
              placeholder="Add a skill"
              className="flex-1 rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addSkillWanted}
              className="rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skillsWanted.map((skill, index) => (
              <span
                key={index}
                className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkillWanted(skill)}
                  className="text-purple-800 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="rounded border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;

