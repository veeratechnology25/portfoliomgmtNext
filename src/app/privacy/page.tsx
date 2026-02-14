import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-600">
                We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form.
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Account credentials</li>
                <li>Project and business information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-600">
                Any of the information we collect from you may be used in one of the following ways:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                <li>To personalize your experience</li>
                <li>To improve our website</li>
                <li>To improve customer service</li>
                <li>To process transactions</li>
                <li>To send periodic emails</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Protection</h2>
              <p className="text-gray-600">
                We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
              <p className="text-gray-600">
                We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h2>
              <p className="text-gray-600">
                We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
              <p className="text-gray-600">
                You have the right to access, update, or delete your personal information at any time. You can contact us to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Compliance with Laws</h2>
              <p className="text-gray-600">
                We will disclose your personal information without notice only if required to do so by law or in the good faith belief that such action is necessary.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Privacy Policy</h2>
              <p className="text-gray-600">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at privacy@portfoliomgmt.com
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
