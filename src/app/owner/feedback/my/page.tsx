"use client";

import { useState, useEffect } from "react";
import { feedbackService } from "@/services/feedback";
import { useAuth } from "@/contexts/AuthContext";
import { Feedback } from "@/types";
import Link from "next/link";

export default function OwnerMyFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId, userRole, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadMyFeedbacks = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        // Use user-specific endpoint for better performance
        const myFeedbacks = await feedbackService.getFeedbackByUserId(userId);
        setFeedbacks(myFeedbacks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your feedback");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadMyFeedbacks();
    }
  }, [userId]);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Feedback</h1>
        <Link href="/owner/feedback" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
          Add New Feedback
        </Link>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">Here you can view all the feedback you&apos;ve submitted. Your feedback helps improve the platform and services.</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Feedback Yet</h2>
          <p className="text-gray-500 text-lg mb-6">You haven&apos;t submitted any feedback yet. Share your thoughts to help improve our platform!</p>
          <Link href="/owner/feedback" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200">
            Submit Your First Feedback
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
                    <h3 className="text-lg font-bold text-gray-900">Feedback #{feedback.FeedbackId}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-green-600">✓ Your Feedback</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Submitted</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Feedback Content */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-medium text-blue-700">Your Message</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed italic">&ldquo;{feedback.FeedbackText}&rdquo;</p>
                </div>

                {/* Date Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">📅 Submitted:</span>
                    <span className="text-sm font-medium text-gray-900">{new Date(feedback.Date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">⏰ Time:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(feedback.Date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Thank You Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center text-sm text-gray-500 bg-green-50 rounded-lg p-3">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Thank you for your valuable feedback
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
