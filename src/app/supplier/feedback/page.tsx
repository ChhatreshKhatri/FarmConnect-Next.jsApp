"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService } from "@/services/feedback";
import { Feedback } from "@/types";
import Link from "next/link";

export default function SupplierFeedback() {
  const { isAuthenticated, userRole, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadFeedbacks();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await feedbackService.getAllFeedback();
      setFeedbacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading authentication...</span>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not supplier
  if (!isAuthenticated || userRole !== "Supplier") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to suppliers.</p>
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Login
          </Link>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Feedback</h1>
        <div className="text-sm text-gray-500">Total: {feedbacks.length} feedback(s)</div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">View feedback from livestock owners to help improve your products and services.</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white shadow-lg rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Feedback Yet</h2>
          <p className="text-gray-500 text-lg mb-6">Customer feedback will appear here when owners submit reviews.</p>
          <p className="text-sm text-gray-400">Keep providing quality products to receive positive feedback!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((feedback) => (
            <div key={feedback.FeedbackId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Customer Review</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-purple-600">💬 Feedback #{feedback.FeedbackId}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">New</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">👤 Customer:</span>
                    <span className="text-sm font-semibold text-gray-900">{feedback.User?.UserName || feedback.User?.Name || "Anonymous User"}</span>
                  </div>
                  <p className="text-xs text-gray-500">ID: {feedback.UserId}</p>
                </div>

                {/* Feedback Content */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-medium text-blue-700">Feedback Message</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed italic">&ldquo;{feedback.FeedbackText}&rdquo;</p>
                </div>

                {/* Date Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(feedback.Date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(feedback.Date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Use this feedback to improve your products
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
