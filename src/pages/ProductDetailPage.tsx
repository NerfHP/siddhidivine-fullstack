import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem, Category } from '@/types';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Button from '@/components/shared/Button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';
import SEO from '@/components/shared/SEO';
import { Heart, Share2, Minus, Plus, CheckCircle, Package, Target, Sparkles, Shield } from 'lucide-react';
import ProductInfoAccordion from '@/components/shared/ProductInfoAccordion';
import ProductImageGallery from '@/components/shared/ProductImageGallery';
import Reviews from '@/components/shared/Reviews';
import ProductFaqSection from '../components/shared/ProductFaqSection';

interface ProductResponse {
  product: ContentItem;
  breadcrumbs: Category[];
}

const fetchProductData = async (slug: string) => {
  const { data } = await api.get(`/content/product-data/${slug}`);
  return data as ProductResponse;
}

const iconMap: { [key: string]: React.ElementType } = {
  CheckCircle, Package, Target, Sparkles, Shield, Heart
};

export default function ProductDetailPage() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // --- NEW: State for the "Energized" checkbox ---
  const [isEnergized, setIsEnergized] = useState(false);
  const ENERGIZING_COST = 151; // Define the cost as a constant

  const { data, isLoading, isError } = useQuery({
    queryKey: ['productDetail', productSlug],
    queryFn: () => fetchProductData(productSlug!),
    enabled: !!productSlug,
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Spinner /></div>;
  if (isError || !data) return <div className="container mx-auto p-8"><Alert type="error" message="Product not found." /></div>;

  const { product, breadcrumbs } = data;
  
  const imageArray: string[] = JSON.parse(product.images || '[]');
  
  // --- CHANGE: Price logic now includes the energizing cost ---
  const basePrice = product.salePrice || product.price || 0;
  const displayPrice = basePrice + (isEnergized ? ENERGIZING_COST : 0);
  const strikethroughPrice = product.salePrice ? product.price : null;


  const specifications = product.specifications ? JSON.parse(product.specifications as unknown as string) : null;
  const benefits = product.benefits ? JSON.parse(product.benefits as unknown as string) : [];
  const howToUse = product.howToUse ? JSON.parse(product.howToUse as unknown as string) : [];
  const packageContents = product.packageContents ? JSON.parse(product.packageContents as unknown as string) : [];

  const handleAddToCart = () => {
    // --- CHANGE: Pass the `isEnergized` state to the cart context ---
    const itemToAdd = { ...product, price: basePrice };
    addToCart(itemToAdd, quantity, isEnergized);
    
    const energizedText = isEnergized ? ' (Energized)' : '';
    toast.success(`${quantity} x ${product.name}${energizedText} added to cart!`);
    
    // Reset state after adding
    setQuantity(1);
    setIsEnergized(false);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...breadcrumbs.map((bc, index) => {
      const path = breadcrumbs.slice(0, index + 1).map(p => p.slug).join('/');
      return { label: bc.name, href: `/products/${path}` };
    }),
    { label: product.name }
  ];

  return (
    <>
      <SEO title={product.name} description={product.description} imageUrl={imageArray[0]} />
      <div className="bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div>
              <ProductImageGallery images={imageArray} productName={product.name} />
            </div>

            <div>
              <h1 className="font-sans text-4xl font-bold text-text-main">{product.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{product.description}</p>
              
              <div className="flex items-baseline gap-3 my-4">
                <p className="text-3xl font-bold text-primary">{formatCurrency(displayPrice)}</p>
                {strikethroughPrice && <p className="text-xl text-gray-400 line-through">{formatCurrency(strikethroughPrice)}</p>}
              </div>

              {/* --- NEW: Energized Product Checkbox Section --- */}
              <div className="my-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <label htmlFor="energize-checkbox" className="flex items-center cursor-pointer">
                  <input
                    id="energize-checkbox"
                    type="checkbox"
                    checked={isEnergized}
                    onChange={() => setIsEnergized(!isEnergized)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-800">
                    🎁 Get Siddh/Energized Product (Pran Pratishtha) + {formatCurrency(ENERGIZING_COST)}
                  </span>
                </label>
              </div>
              
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">Quantity:</p>
                <div className="flex items-center border rounded-md bg-white">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50"><Minus size={14} /></button>
                    <span className="px-4 text-sm font-bold w-12 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 hover:bg-gray-50"><Plus size={14} /></button>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                      <Button size="lg" onClick={handleAddToCart} className="w-full flex-grow">Add to Cart</Button>
                      <Button size="lg" variant="secondary" className="w-full flex-grow">Buy It Now</Button>
                  </div>
                  <div className="flex gap-3 justify-center">
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"><Heart size={16}/> Add to Wishlist</button>
                      <div className="border-l"></div>
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"><Share2 size={16}/> Share</button>
                  </div>
              </div>
              <div className="mt-8 pt-6 border-t">
                <ProductInfoAccordion />
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            {product.content && (
              <div className="prose max-w-none text-gray-700 mb-8">
                <p>{product.content}</p>
              </div>
            )}
            
            {specifications && (
              <div className="mt-8">
                <h3 className="font-sans text-xl font-bold mb-4">Specifications</h3>
                <div className="border-t">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b text-sm">
                      <dt className="text-gray-600">{key}</dt>
                      <dd className="font-medium text-text-main">{value as string}</dd>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {benefits.length > 0 && (
              <div className="mt-8">
                <h3 className="font-sans text-xl font-bold mb-4">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit: {icon: string, text: string}) => {
                    const Icon = iconMap[benefit.icon] || CheckCircle;
                    return (
                      <div key={benefit.text} className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                        <span className="text-gray-700">{benefit.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {howToUse.length > 0 && (
              <div className="mt-8">
                <h3 className="font-sans text-xl font-bold mb-4">How to Use</h3>
                <div className="space-y-4">
                  {howToUse.map((step: {step: number, instruction: string}) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full">{step.step}</div>
                      <p className="text-gray-700 pt-1">{step.instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {packageContents.length > 0 && (
              <div className="mt-8">
                <h3 className="font-sans text-xl font-bold mb-4">What's in the Box</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {packageContents.map((content: string) => <li key={content}>{content}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-12 pt-8 border-t">
              <Reviews productId={product.id} />
            </div>

            <ProductFaqSection productId={product.id} />

          </div>
        </div>
      </div>
    </>
  );
}