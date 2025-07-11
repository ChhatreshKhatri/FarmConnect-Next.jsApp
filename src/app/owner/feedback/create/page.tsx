"use client";

import { useState } from "react";
import Link from "next/link";
import { feedbackService } from "@/services/feedback";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function CreateFeedback() {
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { userId, userRole, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !feedbackText.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await feedbackService.addFeedback({
        FeedbackId: 0, // Will be set by backend
        UserId: userId,
        FeedbackText: feedbackText.trim(),
        Date: new Date().toISOString(),
      });

      setSuccess("Feedback submitted successfully!");
      setFeedbackText("");

      // Redirect to main feedback page after 2 seconds
      setTimeout(() => {
        router.push("/owner/feedback");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated or not an owner
  if (!isAuthenticated || (userRole && userRole !== "Owner")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Feedback</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link href="/owner/feedback" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200 text-center text-sm">
              ← Back to Feedback
            </Link>
            <Link href="/owner/feedback/my" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-center text-sm">
              📝 My Feedback
            </Link>
          </div>
        </div>

        <p className="text-gray-600 mb-6">We value your feedback! Please share your thoughts about our platform, suggestions for improvement, or any issues you&apos;ve encountered.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please share your feedback here..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">Characters: {feedbackText.length} (minimum 10 characters recommended)</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
              <div className="text-sm mt-2">Redirecting to feedback page...</div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => {
                setFeedbackText("");
                setError("");
                setSuccess("");
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200">
              Clear
            </button>
            <button type="submit" disabled={loading || !feedbackText.trim() || feedbackText.trim().length < 5} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
