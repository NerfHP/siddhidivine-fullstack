import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Star, CheckCircle, UploadCloud, X, Clock } from 'lucide-react';
import Spinner from './Spinner';
import { useState, useRef, DragEvent } from 'react';
import Button from './Button';
import Input from './Input';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
import { z } from 'zod';

// --- TYPES (Updated for anonymous reviews) ---
interface Review {
  id: string;
  rating: number;
  comment: string | null;
  imageUrl?: string | null;
  createdAt: string;
  isApproved: boolean;
  user?: {
    name: string;
  };
  // For anonymous reviews
  guestName?: string;
  guestEmail?: string;
}

interface ReviewsProps {
  productId: string;
}

// --- VALIDATION SCHEMAS ---
const guestReviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

type GuestReviewFormData = z.infer<typeof guestReviewSchema>;

// --- API CALLS (Updated) ---
const fetchReviews = async (productId: string) => {
  const { data } = await api.get(`/reviews/${productId}`);
  return data as Review[];
};

const uploadImage = async (file: File): Promise<string> => {
  console.log(`Simulating upload for file: ${file.name}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  const placeholderUrl = `https://placehold.co/600x400/F7F7F7/CCC?text=Review+Image`;
  console.log(`Simulated upload complete. URL: ${placeholderUrl}`);
  return placeholderUrl;
};

// Updated API call to handle both authenticated and guest reviews
const postReview = async ({ 
  productId, 
  rating, 
  comment, 
  imageUrl, 
  guestName, 
  guestEmail 
}: { 
  productId: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  guestName?: string;
  guestEmail?: string;
}) => {
  const payload: any = { productId, rating, comment };
  
  if (imageUrl) payload.imageUrl = imageUrl;
  if (guestName && guestEmail) {
    payload.guestName = guestName;
    payload.guestEmail = guestEmail;
    payload.isGuestReview = true;
  }
  
  const { data } = await api.post('/reviews', payload);
  return data;
};

// --- SUB-COMPONENTS ---

const RatingSummary = ({ reviews }: { reviews: Review[] }) => {
  // Only count approved reviews for the summary
  const approvedReviews = reviews.filter(review => review.isApproved);
  
  if (approvedReviews.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-6xl font-bold text-gray-400">N/A</p>
          <div className="flex my-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={24} className="text-gray-300" />)}
          </div>
          <p className="text-gray-500">0 reviews</p>
        </div>
        <div className="md:col-span-2 text-center md:text-left">
          <p className="text-gray-600 font-medium text-lg">No reviews yet.</p>
          <p className="text-gray-500">Be the first to share your thoughts on this product!</p>
        </div>
      </div>
    );
  }

  const totalReviews = approvedReviews.length;
  const averageRating = approvedReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: approvedReviews.filter(r => r.rating === star).length
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-6xl font-bold text-text-main">{averageRating.toFixed(1)}</p>
        <div className="flex my-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={24} className={i < Math.round(averageRating) ? "text-yellow-500 fill-current" : "text-gray-300"} />
          ))}
        </div>
        <p className="text-gray-600">{totalReviews} reviews</p>
      </div>
      
      <div className="lg:col-span-2">
        {ratingCounts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2 my-1">
            <span className="text-sm font-medium">{star} ★</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(count / totalReviews) * 100}%` }}></div>
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const reviewerName = review.user?.name || review.guestName || 'Anonymous';
  const isVerified = !!review.user; // Only registered users are verified
  
  return (
    <div className="bg-white p-4 rounded-lg border flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-text-main">{reviewerName}</p>
          {isVerified && (
            <span className="text-green-600 flex items-center gap-1 text-xs">
              <CheckCircle size={14} /> Verified
            </span>
          )}
          {!review.isApproved && (
            <span className="text-orange-600 flex items-center gap-1 text-xs">
              <Clock size={14} /> Pending Approval
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} />
        ))}
      </div>
      <p className="text-sm text-gray-700 flex-grow">{review.comment || 'No comment provided.'}</p>
      {review.imageUrl && (
        <img 
          src={review.imageUrl} 
          alt="Review attachment" 
          className="mt-3 rounded-lg max-h-48 w-auto cursor-pointer self-start" 
          onClick={() => review.imageUrl && window.open(review.imageUrl, '_blank')}
        />
      )}
    </div>
  );
};

const ReviewForm = ({ 
  onSubmit, 
  isLoading, 
  isAuthenticated 
}: { 
  onSubmit: (data: { 
    rating: number;
    comment: string;
    imageFile: File | null;
    guestName?: string;
    guestEmail?: string;
  }) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Partial<GuestReviewFormData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Please select an image under 5MB.");
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error("Invalid file type. Please select a JPG, PNG, or GIF.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); };
  
  const validateForm = (): boolean => {
    setErrors({});
    
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return false;
    }

    if (!isAuthenticated) {
      try {
        guestReviewSchema.parse({
          name: guestName,
          email: guestEmail,
          rating,
          comment
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Partial<GuestReviewFormData> = {};
          error.errors.forEach((err) => {
            const field = err.path[0] as keyof GuestReviewFormData;
            fieldErrors[field] = err.message as any;
          });
          setErrors(fieldErrors);
          
          // Show first error as toast
          const firstError = error.errors[0];
          toast.error(firstError.message);
          return false;
        }
      }
    } else if (comment.length < 10) {
      toast.error("Comment must be at least 10 characters.");
      return false;
    }

    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submissionData: {
      rating: number;
      comment: string;
      imageFile: File | null;
      guestName?: string;
      guestEmail?: string;
    } = { rating, comment, imageFile };

    if (!isAuthenticated) {
      submissionData.guestName = guestName;
      submissionData.guestEmail = guestEmail;
    }

    onSubmit(submissionData);
    
    // Reset form
    setRating(0);
    setComment("");
    setGuestName("");
    setGuestEmail("");
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border">
      <p className="font-semibold mb-2 text-lg text-text-main">Write a review</p>
      
      {!isAuthenticated && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            <strong>Share your experience!</strong> Your review will be published after approval and may be featured in our testimonials.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Your name *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                error={errors.name}
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your email *"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                error={errors.email}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            We'll use your email to verify your review and may contact you about featuring it as a testimonial.
          </p>
        </div>
      )}
      
      <div className="flex items-center mb-4">
        <span className="text-sm font-medium text-gray-700 mr-3">Rating:</span>
        {[1, 2, 3, 4, 5].map(star => (
          <button 
            type="button" 
            key={star} 
            onClick={() => setRating(star)} 
            className="p-1 text-gray-300 hover:text-yellow-400 transition-colors"
          >
            <Star size={28} className={star <= rating ? "text-yellow-400 fill-current" : ""} />
          </button>
        ))}
        {errors.rating && <span className="text-red-500 text-sm ml-2">{errors.rating}</span>}
      </div>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts about the product... (minimum 10 characters)"
        className={`w-full p-2 border rounded-md focus:ring-primary focus:border-primary ${
          errors.comment ? 'border-red-300' : 'border-gray-300'
        }`}
        rows={4}
      />
      {errors.comment && <p className="text-red-500 text-sm mt-1">{errors.comment}</p>}
      
      <div className="mt-4">
        {imagePreview ? (
          <div className="p-2 border rounded-md bg-white text-center relative">
            <img src={imagePreview} alt="Review preview" className="rounded max-h-40 mx-auto" />
            <button 
              type="button" 
              onClick={() => { setImageFile(null); setImagePreview(null); }} 
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"
            >
              <X size={14}/>
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".jpg,.jpeg,.png,.gif" 
              onChange={(e) => handleFileChange(e.target.files)} 
            />
            <div className="flex flex-col items-center text-gray-500">
              <UploadCloud size={32} className="mb-2" />
              <p className="font-semibold">Add image (optional)</p>
              <p className="text-xs mt-1">Drag & drop or click to upload (JPG, PNG, GIF, max 5MB)</p>
            </div>
          </div>
        )}
      </div>
      
      <Button type="submit" className="mt-4 w-full" size="md" disabled={isLoading}>
        {isLoading ? 'Submitting...' : isAuthenticated ? 'Submit Review' : 'Submit Review for Approval'}
      </Button>
      
      {!isAuthenticated && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Your review will be reviewed by our team before being published.
        </p>
      )}
    </form>
  );
};

// --- MAIN COMPONENT ---
export default function Reviews({ productId }: ReviewsProps) {
  const { user } = useUser();
  const isAuthenticated = !!user; // This will be true if a user is logged in, and false otherwise.
  const queryClient = useQueryClient();
  
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviews(productId),
  });
  
  const mutation = useMutation({
    mutationFn: postReview,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      
      if (variables.guestName) {
        toast.success("Thank you for your review! It will be published after approval.");
      } else {
        toast.success("Thank you for your review!");
      }
    },
    onError: (error: any) => {
      console.error('Review submission error:', error);
      toast.error("Failed to submit review. Please try again.");
    }
  });

  const handleSubmitReview = async ({ 
    rating, 
    comment, 
    imageFile, 
    guestName, 
    guestEmail 
  }: { 
    rating: number;
    comment: string;
    imageFile: File | null;
    guestName?: string;
    guestEmail?: string;
  }) => {
    let imageUrl: string | undefined = undefined;
    
    if (imageFile) {
      toast.loading('Uploading your image...');
      try {
        imageUrl = await uploadImage(imageFile);
        toast.dismiss();
      } catch (error) {
        toast.dismiss();
        toast.error('Failed to upload image. Submitting review without image.');
      }
    }
    
    mutation.mutate({ 
      productId, 
      rating, 
      comment, 
      imageUrl, 
      guestName, 
      guestEmail 
    });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  // Filter reviews to show only approved ones, unless user is admin (you can implement admin check)
  const displayReviews = reviews?.filter(review => review.isApproved) || [];
  
  return (
    <div className="bg-background p-6 rounded-lg border">
      <h2 className="font-sans text-3xl font-bold mb-6 text-text-main">Reviews</h2>
      <div className="border-b pb-6 mb-6">
        <RatingSummary reviews={displayReviews} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          {displayReviews.length > 0 ? (
            displayReviews.map(review => <ReviewCard key={review.id} review={review} />)
          ) : (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
        <div>
          <ReviewForm 
            onSubmit={handleSubmitReview} 
            isLoading={mutation.isPending} 
            isAuthenticated={isAuthenticated} 
          />
        </div>
      </div>
    </div>
  );
}