import SEO from "@/components/shared/SEO";

export default function AboutPage() {
  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about our mission to provide authentic spiritual products and services to seekers around the world."
      />
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-center font-sans text-4xl font-bold text-secondary">About Siddhi Divine</h1>
            <p className="mt-4 text-center text-lg text-gray-600">
              Your trusted partner on the journey to spiritual enlightenment and well-being.
            </p>
            <div className="prose lg:prose-lg mx-auto mt-8 text-gray-700">
              <p>
                Welcome to Siddhi Divine, a sanctuary for those seeking to connect with ancient traditions and spiritual wisdom. Our mission is to make authentic, high-quality spiritual products and services accessible to everyone, regardless of where they are on their journey.
              </p>
              <p>
                Founded on the principles of integrity, authenticity, and respect, we work closely with skilled artisans, knowledgeable priests, and expert astrologers to bring you offerings that are not only beautiful but also spiritually potent.
              </p>
              <h3>Our Philosophy</h3>
              <p>
                We believe that spirituality is a personal path and that the right tools and guidance can make the journey more profound. Whether you are looking for a beautifully crafted idol for your home temple, seeking guidance through an astrological reading, or wishing to perform a traditional puja, we are here to support you with resources you can trust.
              </p>
              <p>
                Thank you for choosing Siddhi Divine. We are honored to be a part of your spiritual exploration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}