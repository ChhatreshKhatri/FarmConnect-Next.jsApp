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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
        <div className="text-sm text-gray-500">Total: {feedbacks.length} feedback(s)</div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">View feedback from livestock owners to help improve your products and services.</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No feedback available</div>
          <p className="text-gray-400 mt-2">Customer feedback will appear here when owners submit reviews.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {feedbacks.map((feedback) => (
            <div key={feedback.FeedbackId} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Customer Feedback</h3>
                  <p className="text-sm text-gray-600">From Customer: {feedback.UserId}</p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{new Date(feedback.Date).toLocaleDateString()}</span>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed">{feedback.FeedbackText}</p>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Use this feedback to improve your medicines and feeds
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
