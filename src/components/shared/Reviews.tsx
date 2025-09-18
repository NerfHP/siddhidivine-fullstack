import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Star, CheckCircle, UploadCloud, X } from 'lucide-react';
import Spinner from './Spinner';
import { useState, useRef, DragEvent } from 'react';
import Button from './Button';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

// --- TYPES (Upgraded) ---
interface Review {
  id: string;
  rating: number;
  comment: string | null;
  imageUrl?: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}
interface ReviewsProps {
  productId: string;
}

// --- API CALLS (CORRECTED) ---
const fetchReviews = async (productId: string) => {
  // THE FIX: The `/api` prefix has been removed. 
  // Your central `api.ts` file handles this automatically.
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

const postReview = async ({ productId, rating, comment, imageUrl }: { productId: string, rating: number, comment: string, imageUrl?: string }) => {
    // THE FIX: The `/api` prefix has been removed here as well.
    const { data } = await api.post('/reviews', { productId, rating, comment, imageUrl });
    return data;
}

// --- SUB-COMPONENTS (NOW FULLY IMPLEMENTED AND CORRECTED) ---

const RatingSummary = ({ reviews }: { reviews: Review[] }) => {
  if (reviews.length === 0) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center justify-center text-center">
                <p className="text-6xl font-bold text-gray-400">N/A</p>
                <div className="flex my-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={24} className="text-gray-300" />)}
                </div>
                <p className="text-gray-500">{reviews.length} reviews</p>
            </div>
             <div className="md:col-span-2 text-center md:text-left">
                <p className="text-gray-600 font-medium text-lg">No reviews yet.</p>
                <p className="text-gray-500">Be the first to share your thoughts on this product!</p>
            </div>
          </div>
      );
  }

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
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

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-white p-4 rounded-lg border flex flex-col">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <p className="font-bold text-sm text-text-main">{review.user.name}</p>
        <span className="text-green-600 flex items-center gap-1 text-xs"><CheckCircle size={14} /> Verified</span>
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
      <img src={review.imageUrl} alt="Review attachment" className="mt-3 rounded-lg max-h-48 w-auto cursor-pointer self-start" onClick={() => review.imageUrl && window.open(review.imageUrl, '_blank')}/>
    )}
  </div>
);

const ReviewForm = ({ onSubmit, isLoading, isAuthenticated }: { onSubmit: (data: { rating: number, comment: string, imageFile: File | null }) => void, isLoading: boolean, isAuthenticated: boolean }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
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
    
    if (!isAuthenticated) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <p className="font-semibold text-lg text-text-main">Want to share your experience?</p>
                <p className="text-gray-600 mt-1 mb-4">Please log in to write a review and share your photos.</p>
                <Button asChild><Link to="/login">Login to Review</Link></Button>
            </div>
        );
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }
        onSubmit({ rating, comment, imageFile });
        setRating(0);
        setComment("");
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border">
            <p className="font-semibold mb-2 text-lg text-text-main">Write a review</p>
            <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)} className="p-1 text-gray-300 hover:text-yellow-400 transition-colors">
                        <Star size={28} className={star <= rating ? "text-yellow-400 fill-current" : ""} />
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the product..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                rows={4}
            />
            
            <div className="mt-4">
                {imagePreview ? (
                     <div className="p-2 border rounded-md bg-white text-center relative">
                        <img src={imagePreview} alt="Review preview" className="rounded max-h-40 mx-auto" />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700">
                            <X size={14}/>
                        </button>
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.gif" onChange={(e) => handleFileChange(e.target.files)} />
                        <div className="flex flex-col items-center text-gray-500">
                            <UploadCloud size={32} className="mb-2" />
                            <p className="font-semibold">Add files or drag here</p>
                            <p className="text-xs mt-1">(Accepts .gif, .jpg, .png and 5MB limit)</p>
                        </div>
                    </div>
                )}
            </div>
            
            <Button type="submit" className="mt-4 w-full" size="md" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    );
};

// --- MAIN COMPONENT (Upgraded) ---
export default function Reviews({ productId }: ReviewsProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth(); 
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviews(productId),
  });
  
  const mutation = useMutation({
    mutationFn: postReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      toast.success("Thank you for your review!");
    },
    onError: () => {
        toast.error("Failed to submit review. Please ensure you are logged in and try again.");
    }
  });

  const handleSubmitReview = async ({ rating, comment, imageFile }: { rating: number, comment: string, imageFile: File | null }) => {
    let imageUrl: string | undefined = undefined;
    if (imageFile) {
      toast.loading('Uploading your image...');
      imageUrl = await uploadImage(imageFile);
      toast.dismiss();
    }
    mutation.mutate({ productId, rating, comment, imageUrl });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="bg-background p-6 rounded-lg border">
      <h2 className="font-sans text-3xl font-bold mb-6 text-text-main">Reviews</h2>
      <div className="border-b pb-6 mb-6">
        <RatingSummary reviews={reviews || []} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map(review => <ReviewCard key={review.id} review={review} />)
          ) : (
            !isLoading && <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to share your thoughts!</p>
          )}
        </div>
        <div>
          <ReviewForm onSubmit={handleSubmitReview} isLoading={mutation.isPending} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
}

