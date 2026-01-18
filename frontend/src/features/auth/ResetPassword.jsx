import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "./authThunks";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return;
    }

    const result = await dispatch(
      resetPassword({ token, password: form.password })
    );

    if (resetPassword.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Password Reset Successful
          </h2>
          <p className="mb-6 text-gray-600">
            Your password has been reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Reset Password
        </h2>

        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            required
            minLength={6}
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            required
            minLength={6}
          />
        </div>

        {form.password &&
          form.confirmPassword &&
          form.password !== form.confirmPassword && (
            <p className="mb-2 text-sm text-red-500">Passwords do not match</p>
          )}

        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || form.password !== form.confirmPassword}
          className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;

