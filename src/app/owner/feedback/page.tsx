"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { feedbackService } from "@/services/feedback";
import { useAuth } from "@/contexts/AuthContext";
import { Feedback } from "@/types";

export default function OwnerFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId, userRole, isAuthenticated, loading: authLoading } = useAuth();

  const loadFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await feedbackService.getAllFeedback();
      setFeedbacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedbacks");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadFeedbacks();
    }
  }, [authLoading, loadFeedbacks]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading authentication...</span>
      </div>
    );
  }

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

  // Show loading while fetching feedbacks
  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Community Feedback</h1>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading feedbacks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Community Feedback</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link href="/owner/feedback/my" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-center">
            📝 My Feedback
          </Link>
          <Link href="/owner/feedback/create" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 text-center">
            ➕ Add Feedback
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Feedback Yet</h2>
          <p className="text-gray-500 text-lg mb-6">Be the first to share your thoughts and help improve our platform!</p>
          <Link href="/owner/feedback/create" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 inline-block">
            ➕ Add Your Feedback
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((feedback) => (
            <div key={feedback.FeedbackId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{feedback.User?.UserName || feedback.User?.Name || "Anonymous User"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-green-600">💬 Feedback</span>
                      {feedback.UserId === userId && <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">You</span>}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">#{feedback.FeedbackId}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👤</span>
                    <span className="text-sm font-medium text-gray-700">User Details</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-medium text-gray-900">{feedback.UserId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">{new Date(feedback.Date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-medium text-gray-700">Feedback Message</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback.FeedbackText}</p>
                </div>

                {/* Timestamp */}
                <div className="text-center">
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
                    📅{" "}
                    {new Date(feedback.Date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Action Button for Own Feedback */}
                {feedback.UserId === userId && (
                  <div className="pt-4 border-t">
                    <Link href="/owner/feedback/my" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 text-center block font-medium">
                      ✏️ Manage My Feedback
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm mb-4">
          Total: {feedbacks.length} feedback{feedbacks.length !== 1 ? "s" : ""} from the community
        </p>
        <Link href="/owner/feedback/create" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 inline-block">
          ➕ Share Your Feedback
        </Link>
      </div>
    </div>
  );
}
