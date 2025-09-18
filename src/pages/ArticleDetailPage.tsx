import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ContentItem } from '@/types';
import Spinner from '@/components/shared/Spinner';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SEO from '@/components/shared/SEO';

const fetchArticleBySlug = async (slug: string) => {
  const { data } = await api.get(`/content/item/${slug}`);
  return data as ContentItem;
};

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message="Article not found or failed to load." />
      </div>
    );
  }

  return (
    <>
    <SEO 
      title={article.name}
      description={article.description}
      imageUrl={article.images[0]}
      type="article"
    />
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: article.name },
          ]}
        />
        <h1 className="mt-4 font-sans text-4xl font-bold">{article.name}</h1>
        <p className="mt-2 text-lg text-gray-600">{article.description}</p>
        <img src={article.images[0]} alt={article.name} className="my-8 w-full rounded-lg object-cover shadow-lg"/>
        <div className="prose lg:prose-lg max-w-none">
          <p>{article.content}</p>
        </div>
      </div>
    </div>
    </>
  );
}