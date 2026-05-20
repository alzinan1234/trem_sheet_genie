"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { reportIssue } from "@/services/issue.service";
import { getMyProfile } from "@/services/user.service";
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

interface ReportForm {
  email: string;
  title: string;
  type: "BUG" | "FEATURE" | "OTHER" | "";
  description: string;
}

const issueTypeMap: Record<string, "BUG" | "FEATURE" | "OTHER"> = {
  bug: "BUG",
  ui: "BUG",
  performance: "BUG",
  payment: "OTHER",
  feature: "FEATURE",
  other: "OTHER",
};

const ReportIssue = () => {
  const [formData, setFormData] = useState<ReportForm>({
    email: "",
    title: "",
    type: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill email from logged-in user
  useEffect(() => {
    getMyProfile()
      .then((res) => {
        if (res.success && res.data.email) {
          setFormData((prev) => ({ ...prev, email: res.data.email }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.title || !formData.type || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Submitting report...");

    try {
      const res = await reportIssue({
        email: formData.email,
        title: formData.title,
        type: issueTypeMap[formData.type] || "OTHER",
        description: formData.description,
      });

      if (res.success) {
        toast.success("Issue reported successfully!", { id: toastId });
        setIsSuccess(true);
        setFormData({ email: formData.email, title: "", type: "", description: "" });
        // Reset success state after 4 seconds
        setTimeout(() => setIsSuccess(false), 4000);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to submit report. Please try again.",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg border border-gray-200 rounded-2xl p-8 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
          Report an Issue
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          Help us improve by reporting bugs or requesting features
        </p>

        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-700">Report submitted!</p>
              <p className="text-xs text-green-600">Our team will review your issue shortly.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#2D60FF] focus:border-[#2D60FF] transition-all bg-gray-50"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Short issue title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#2D60FF] focus:border-[#2D60FF] transition-all bg-gray-50"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#2D60FF] focus:border-[#2D60FF] transition-all bg-gray-50"
            >
              <option value="">Select issue type</option>
              <option value="bug">Bug</option>
              <option value="ui">UI Issue</option>
              <option value="performance">Performance</option>
              <option value="payment">Payment</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#2D60FF] focus:border-[#2D60FF] transition-all bg-gray-50 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2D60FF] text-white py-3 rounded-lg
              hover:bg-[#244ED8] transition font-semibold text-sm
              disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
