"use client";

import { useEffect, useState } from "react";
import {
  Star,
  MessageSquare,
  User,
  Calendar,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Review {
  id: number;
  customerName: string;
  customerEmail: string;
  productName: string;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  helpful: number;
  notHelpful: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Review[];
}

export default function ReviewsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const fetchReviewsData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:5000/api/admin/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews data");
      }

      const result = await response.json();
      setStats(result.stats);
      setReviews(result.reviews);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedReviews = reviews
    .filter((review) => filterRating === null || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading reviews: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>
          <p className="text-gray-500 text-sm">
            Manage and analyze customer feedback
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.totalReviews}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.averageRating.toFixed(1)} ★
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">5-Star Reviews</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.ratingDistribution[5]}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ThumbsUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">1-Star Reviews</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.ratingDistribution[1]}
                </h3>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ThumbsDown size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                stats.ratingDistribution[
                  rating as keyof typeof stats.ratingDistribution
                ];
              const percentage =
                stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star size={14} className="text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by rating:
            </span>
            <div className="flex gap-1">
              {[null, 5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating || "all"}
                  onClick={() => setFilterRating(rating)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterRating === rating
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {rating ? `${rating}★` : "All"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800">
                        {review.customerName}
                      </h4>
                      {review.isVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        on {review.productName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>
                        {new Date(review.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ThumbsUp size={14} />
                  <span>{review.helpful}</span>
                  <ThumbsDown size={14} />
                  <span>{review.notHelpful}</span>
                </div>
              </div>

              {review.comment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
