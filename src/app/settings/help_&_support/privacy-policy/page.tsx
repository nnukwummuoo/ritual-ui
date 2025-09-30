import Head from "../../../../components/Head";

const PrivacyPolicy = () => {

  return (
    <div className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
      

  <div className="flex flex-col w-full px-4 pt-10 text-gray-400 md:px-0 md:pt-6">
      <Head heading="🔒 Privacy Policy" />
      <section>
        <div className="">
          <h2 className="mb-6 text-gray-500">Effective Date: 17th June 2025</h2>
          <p className="mb-3">
            Mmeko respects your privacy. This policy outlines how we collect, use, and protect your personal information.

          </p>

          <h2 className="my-2 text-xl font-semibold text-gray-300">
            1. Information We Collect
          </h2>
          <p className="mb-3">
            Name, email, profile photo, and preferences during sign-up.
            ID documents (creators only) for verification.
            Payment and transaction history.
            Device and browser information for security purposes.

          </p>
  

          <h2 className="my-2 text-xl font-semibold text-gray-300">
            2. How We Use Your Information
          </h2>
          <p className="mb-3">
            To verify user identities.
            To process payments and service requests.
            To personalize user experience.
            To communicate updates or promotions.


          </p>

          <h2 className="my-2 text-xl font-semibold text-gray-300">
           3. Sharing of Data
          </h2>
          <p className="mb-3">
            We do not sell your personal data to third parties.
            We may share data with payment processors or law enforcement if legally required.

          </p>

          <h2 className="my-2 text-xl font-semibold text-gray-300">
            4. Cookies & Tracking
          </h2>
          <p className="mb-3">
           We use cookies to enhance functionality and analytics.
           You can disable cookies in your browser settings, but some features may not work properly.

          </p>

          <h2 className="my-2 text-xl font-semibold text-gray-300">
            5. Security
          </h2>
          <p className="mb-3">
            All data is encrypted and stored securely.
            ID documents are reviewed manually and not shared with other users.



          </p>

          <h2 className="my-2 text-xl font-semibold text-gray-300">
            6. Your Rights

          </h2>
          <p className="mb-3">
            You can request access or deletion of your data at any time.
            Contact support for any privacy-related concerns.


          </p>

          <h2 className="my-2 text-xl font-semibold text-gray-300">
            7. Contacting the Website
          </h2>
          <p className="mb-16">
            If you have any questions about this privacy statement, the practices of this site, or your dealings with this Web site, please contact at mmeko.com.
          </p>
        </div>
      </section>
    </div>
    </div>
  );
};

export default PrivacyPolicy;