import { useEffect } from "react";
import { Mail, Phone } from "lucide-react";
import SEO from "@/components/shared/SEO";

export default function RefundPolicyPage() {
  useEffect(() => {
    // Smooth scroll for TOC links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(
          (link as HTMLAnchorElement).getAttribute("href") || ""
        );
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }, []);

  return (
    <>
      <SEO
        title="Refund & Cancellation Policy"
        description="Review Siddhi Divine’s refund, cancellation, and replacement policies. Customer satisfaction is our top priority."
      />

      {/* Breadcrumb Bar */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 text-sm text-gray-600">
          Home <span className="mx-2">›</span> Refund & Cancellation Policy
        </div>
      </div>

      {/* Page Layout */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 self-start">
            <div className="p-6 bg-gray-50 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Table of Contents
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>
                  <a href="#cancellation" className="hover:text-primary">
                    ❌ Cancellation Policy
                  </a>
                </li>
                <li>
                  <a href="#refund" className="hover:text-primary">
                    🔄 Refund & Replacement
                  </a>
                </li>
                <li>
                  <a href="#process" className="hover:text-primary">
                    📦 Replacement Process
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-primary">
                    📞 Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-10">
            {/* Page Title */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Refund & Cancellation Policy
              </h1>
              <p className="mt-3 text-gray-600 max-w-3xl">
                At <span className="font-semibold">Siddhi Divine</span>, your
                satisfaction is our highest priority. Please review our
                cancellation, refund, and replacement policies carefully before
                making a purchase.
              </p>
            </div>

            {/* Sections */}
            <section
              id="cancellation"
              className="bg-gray-50 rounded-2xl shadow-sm p-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                ❌ Cancellation Policy
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  Cancellations are accepted <b>within 30 minutes</b> of placing
                  an order.
                </li>
                <li>
                  Once an order is confirmed and processing has begun,
                  cancellation requests cannot be guaranteed.
                </li>
                <li>
                  <b>No cancellation fees</b> are charged within the 30-minute
                  window.
                </li>
                <li>
                  If Siddhi Divine cancels due to stock or logistics issues,
                  customers receive a <b>full refund</b>.
                </li>
              </ul>
            </section>

            <section
              id="refund"
              className="bg-gray-50 rounded-2xl shadow-sm p-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                🔄 Refund & Replacement Policy
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  We follow a <b>1-day replacement policy</b> for damaged,
                  defective, or incorrect items.
                </li>
                <li>
                  Requests must be made within 1 day of delivery with proof
                  (unboxing video & images mandatory).
                </li>
                <li>
                  Returns for size preference, quality concerns, or personal
                  choice are <b>not accepted</b>.
                </li>
                <li>
                  Used, washed, or customer-damaged products, or items without
                  original packaging, are not eligible.
                </li>
              </ul>
            </section>

            <section
              id="process"
              className="bg-gray-50 rounded-2xl shadow-sm p-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                📦 Replacement Process
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>
                  <b>Initiate Request:</b> Contact us within 1 day via WhatsApp
                  or email.
                </li>
                <li>
                  <b>Return Product:</b> Send the unused item back in its
                  original packaging.
                </li>
                <li>
                  <b>Verification:</b> Our team will inspect the product.
                </li>
                <li>
                  <b>Replacement Fee:</b> For size exchanges, a ₹200 fee applies
                  (shipping & handling).
                </li>
                <li>
                  <b>Dispatch:</b> Once approved, we ship the replacement and
                  share tracking details.
                </li>
              </ol>
            </section>

            <section
              id="contact"
              className="bg-gray-50 rounded-2xl shadow-sm p-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                📞 Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our policy, don’t hesitate to
                reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 not-prose">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary" />
                  <a
                    href="mailto:support@siddhidivine.com"
                    className="font-medium"
                  >
                    support@siddhidivine.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-primary" />
                  <a href="tel:+911234567890" className="font-medium">
                    +91 123 456 7890
                  </a>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
