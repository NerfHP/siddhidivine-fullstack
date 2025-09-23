import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { ContentItem } from '../../types';
import Spinner from '../../components/shared/Spinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

// Fetches all products from the public API endpoint.
const fetchProducts = async (): Promise<ContentItem[]> => {
    const { data } = await api.get('/content/products');
    return data;
};

/**
 * The main admin page for viewing and managing products.
 */
export default function ProductsAdminPage() {
    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['adminProducts'],
        queryFn: fetchProducts,
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                </Button>
            </div>

            {isLoading && <div className="flex justify-center"><Spinner /></div>}
            {isError && <Alert type="error" message="Could not fetch products." />}

            {products && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.price || 0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {product.isPublished ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Draft</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-primary hover:text-primary-dark">Edit</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

