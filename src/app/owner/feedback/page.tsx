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
        <div className="grid gap-4 sm:gap-6">
          {feedbacks.map((feedback) => (
            <div key={feedback.FeedbackId} className="bg-white rounded-lg shadow-md p-4 sm:p-6 border">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <span className="text-blue-600 text-sm font-semibold">👤</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      User #{feedback.UserId}
                      {feedback.UserId === userId && <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">You</span>}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(feedback.Date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Feedback #{feedback.FeedbackId}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback.FeedbackText}</p>
              </div>

              {feedback.UserId === userId && (
                <div className="mt-4 flex justify-end">
                  <Link href="/owner/feedback/my" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                    ✏️ Manage My Feedback
                  </Link>
                </div>
              )}
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
