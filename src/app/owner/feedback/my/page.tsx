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
  const { userId } = useAuth();

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Feedback</h1>
        <Link href="/owner/feedback" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200">
          Add New Feedback
        </Link>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">Here you can view all the feedback you&apos;ve submitted. Your feedback helps improve the platform and services.</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">You haven&apos;t submitted any feedback yet</div>
          <p className="text-gray-400 mt-2">Share your thoughts to help improve our platform!</p>
          <Link href="/owner/feedback" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-200">
            Submit Your First Feedback
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {feedbacks.map((feedback) => (
            <div key={feedback.FeedbackId} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Feedback #{feedback.FeedbackId}</h3>
                  <p className="text-sm text-green-600">✓ Submitted by you</p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{new Date(feedback.Date).toLocaleDateString()}</span>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed">{feedback.FeedbackText}</p>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Thank you for your feedback
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
