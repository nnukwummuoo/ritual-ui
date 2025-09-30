import Head from "../../../../components/Head";


const TermCondition = () => {

  return (
    <div className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
     
    <div className="flex flex-col w-full px-4 text-gray-400 md:px-0">
        <Head heading="✅ Terms and Conditions" />
        <p className="mb-6 text-gray-500">Effective Date: 17th June 2025
</p>
        
        <section className="mb-6">
          <p className="mb-4">
            Welcome to Mmeko ("the Website"). By accessing or using our platform,
             you agree to the following Terms and Conditions. If you do not agree with any part 
             of these terms, you must not use our services.

          </p>
        </section>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">1. Eligibility</h3>
        <p className="mb-6">
         You must be at least 18 years old to use or register as a creator or fan on our platform.
         All creators must complete ID verification before offering services.

        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">2. Account & Conduct</h3>
        <p className="mb-6">
          You are responsible for maintaining the confidentiality of your account credentials.
          You agree not to:Upload or share explicit, pornographic, or violent content.Use the platform
           for illegal activities or to facilitate prostitution.Misrepresent your identity or services offered.
            </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">3. Creator Services</h3>
        <p className="mb-6">
          Creators may offer Fan Meet, Fan Date, and Fan Call services.
          All payments for Fan Meet or Fan Date go into a pending state and are released after the
           fan marks the appointment as complete.Creators earn per minute during active Fan Call.
           Transport fare must be clearly stated by the creator, including any embedded costs.


        </p>

         <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">4. Gold System & Earnings</h3>
        <p className="mb-6">
          Earnings on the platform are based on a virtual currency called Gold. All values, rates, and payouts are subject to the Gold Conversion Policy outlined below.”


        </p>

        <p className="mb-6">
          1. Gold Currency System

        </p>

        <p className="mb-6">
          The Platform uses a virtual currency known as Gold for all fan payments and creator earnings. Fans purchase Gold to access paid features, including Fan Meet, Fan Date, Private Show, and digital content.



        </p>

        <p className="mb-6">
          2. Gold-to-Dollar Conversion

        </p>

        <p className="mb-6">
          For creators, 1 Gold = $0.04 USD (starting rate).
          This rate reflects the platform’s internal valuation and 
          may differ from the price fans pay when purchasing Gold.


        </p>

        <p className="mb-6">
          3. Revenue Share Creator


        </p>

        <p className="mb-6">
         Creators are not charged platform fees or commission on their earnings.
        </p>

        <p className="mb-6">
          This system ensures transparent earnings with no surprise deductions.


        </p>

        <p className="mb-6">
          4. Earnings & Withdrawals


        </p>

        <p className="mb-6">
          Creators can request a withdrawal once their account balance reaches $50 or more.
           Balances below this threshold will remain in the account until the minimum is met.
           Withdrawals are processed via available payment channels (e.g., Payoneer,
            or bank transfer) subject to minimum thresholds and local banking rules.


        </p>

        <p className="mb-6">
          5. Payout Requests


        </p>

        <p className="mb-6">
          Payouts must be manually requested from your dashboard. 
          Processing may take up to 5 business days, depending on verification and 
          payment method.


        </p>

        <p className="mb-6">
         6. Payout Methods Available

        </p>

        <p className="mb-6">
          We currently support the following withdrawal options:


        </p>

        <p className="mb-6">
          USDT (BEP-20)


        </p>

        <p className="mb-6">
          Payoneer


        </p>

        <p className="mb-6">
          Local Bank Transfer
        </p>

        <p className="mb-6">
          Please ensure your wallet or account details are correct before requesting a
           payout. We are not responsible for losses due to incorrect or incomplete 
           information.


        </p>

        <p className="mb-6">
          7. Fees & Charges


        </p>

        <p className="mb-6">
          We do not charge platform fees on withdrawals. However, external fees 
          (e.g., blockchain gas fees, Payoneer transaction fees, or bank processing fees)
           may apply depending on the method you choose.



        </p>

        <p className="mb-6">
          8. Fraud & Abuse


        </p>

        <p className="mb-6">
          Any attempt to manipulate earnings or abuse the platform will result in account 
          suspension and forfeiture of earnings.

        </p>


        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">5. Content Ownership</h3>
        <p className="mb-6">
          Creators retain ownership of their content but grant us a non-exclusive license to display and promote it on the platform.
          You may not upload copyrighted or stolen content.


        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">6. Fees and Revenue</h3>
       <p className="mb-6">
        The platform is free to use.
        Creators keep 100% of their revenue.
        After this period, platform fees may apply, which will be disclosed in advance.
        </p>
        
    
        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">7. Termination</h3>
        <p className="mb-6">
          We reserve the right to suspend or terminate any account that violates our terms.
          Users can terminate their account anytime via account settings.

        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">8. Dispute Resolution</h3>
        <p className="mb-6">
          In case of disputes between fans and creators, users are encouraged to contact support with clear evidence (screenshots, photos, videos).
          We will act as a neutral third-party, but do not guarantee resolution outcomes.

        </p>
      </div>
    </div>
  );
};

export default TermCondition;