import React, { useState } from 'react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 to-primary-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              SUBSCRIBE TO OUR NEWSLETTER
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Stay updated with our latest news, and events. Join any of our campuses and never miss a moment of God&apos;s work.
            </p>
          </div>

          {/* Newsletter Form */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="w-full px-6 py-4 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-md font-semibold hover:bg-yellow-300 transition-colors duration-200"
                >
                  SUBSCRIBE
                </button>
              </div>
            </form>

            {/* Success Message */}
            {isSubscribed && (
              <div className="mt-4 p-4 bg-green-500 text-white rounded-lg animate-pulse">
                Thank you for subscribing! You&apos;ll receive our updates soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection; 