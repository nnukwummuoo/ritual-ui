import Head from "@/components/Head";

const TermsAndConditions = () => {
  return (
    <div className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
      <div className="flex flex-col w-full px-4 text-gray-400 md:px-0">
        <Head heading="✅ Terms and Conditions" />
        <p className="mb-6 text-gray-500">Effective Date: 19th July 2026</p>

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
          All creators must complete ID verification before creating a portfolio.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">2. Account & Conduct</h3>
        <p className="mb-6">
          You are responsible for maintaining the confidentiality of your account credentials.
          You agree not to: Upload or share explicit, pornographic, or violent content on the homepage, ritual page and portfolio page. Use the platform
          for illegal activities or to facilitate prostitution. Misrepresent your identity or services offered.
        </p>

        <p className="mb-6">Explicit Content is strictly prohibited on the homepage, ritual page and portfolio page.</p>

        <p className="mb-6">
          Any Creator or Fan who posts, shares, or requests explicit content will be banned immediately — no second chances.
        </p>

        <p className="mb-6">
          Harassment, hate speech, or illegal activity also results in permanent removal.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">3. Fan Call, Fan Meet, Fan Date</h3>
        <p className="mb-6">1. Fan Call</p>
        <p className="mb-6">Creator is paid per call requested.</p>
        <p className="mb-6">2. Fan Meet</p>
        <p className="mb-6">Creator sets availability; fans cover rate.</p>
        <p className="mb-6">3. Fan Date</p>
        <p className="mb-6">Creator chooses; fans pay all costs upfront (including transport).</p>
        <p className="mb-6">Creators always have the right to accept or decline any request.</p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">4. Client Verification & Booking Transparency</h3>
        <p className="mb-6">
          When a fan submits a booking request, Mmeko immediately sends the creator the fan's verified identity details,
          including their ID and selfie confirmation. This ensures creators always know who they are meeting before
          confirming any booking. Creators may decline any request at their discretion.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">5. Platform Communication Policy</h3>
        <p className="mb-6">
          All communication between creators and fans must take place on the Mmeko platform. Creators are strongly
          encouraged to keep their full booking conversation on the platform, including:
        </p>
        <p className="mb-6">— Notifying the fan when leaving home</p>
        <p className="mb-6">— Notifying the fan upon arrival at the meeting location</p>
        <p className="mb-6">— Confirming presence at the meeting spot</p>
        <p className="mb-6">
          This communication serves as proof of attendance and protects the creator in the event of any dispute.
          Mmeko uses on-platform chat history as the primary evidence when reviewing any claim or support request.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">6. Date Quality & Payment Policy</h3>
        <p className="mb-6">
          Mmeko does not judge the quality of a date or the experience of either party. Mmeko only verifies whether
          the meet or date occurred.
        </p>
        <p className="mb-6">
          If the on-platform chat history confirms that the creator arrived and the meet took place, Mmeko will
          release the creator's payment in full — regardless of how the fan felt about the experience.
        </p>
        <p className="mb-6">
          Fans cannot withhold or dispute payment based on personal satisfaction, preferences, or subjective experience.
          Payment disputes are reviewed solely on the basis of whether the meeting occurred, as evidenced by
          on-platform communication.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">7. Attendance & Refund Policy</h3>
        <p className="mb-6">1. Fan No-Show</p>
        <p className="mb-6">
          If a fan does not attend the scheduled appointment, the creator must contact Support immediately.
          Support will review the case and release the creator's payment immediately as compensation for time and travel.
          Creators must contact Support within 18 days from the appointment date.
          If Support is not contacted within this window, the payment will be automatically refunded to the fan.
        </p>

        <p className="mb-6">2. Creator No-Show</p>
        <p className="mb-6">
          If a creator does not attend the scheduled appointment, the fan will automatically receive a full refund.
          Refunds are released to the fan automatically on the 20th day from the appointment date, without requiring any action.
        </p>

        <p className="mb-6">3. Auto-Refund System</p>
        <p className="mb-6">
          If the fan didn't mark the meet or date as "Completed" within 20 days after the scheduled event,
          and no complaint or dispute has been filed by the creator within 18 days from the appointment date,
          the fan will automatically receive a full refund of the payment on the 20th day.
          This ensures fairness and protects both parties in cases where no meeting occurred.
        </p>

        <p className="mb-6">4. Proof of Attendance</p>
        <p className="mb-6">
          Both parties are strongly encouraged to keep all communication on the platform. On-platform chat history
          is the primary tool used by Mmeko Support for faster and more accurate dispute resolution.
          Creators who notify fans of their departure, arrival, and presence at the meeting spot through the
          platform are better protected in any dispute scenario.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">8. Fan Meet & Fan Date Expiry</h3>
        <p className="mb-6">1. Fan Meet / Fan Date Expiration Policy</p>
        <p className="mb-6">
          If a meeting does not happen and the fan didn't mark it as complete within 20 days, the system
          will automatically refund the fan in full — provided no complaint was filed by the creator within
          18 days from the appointment date.
        </p>
        <p className="mb-6">
          After the 20 days, if there's no confirmation or complaint, the request will expire automatically
          and the pending payment is released back to the fan.
        </p>
        <p className="mb-6">
          This ensures fairness, protects both parties, and keeps the platform free of unresolved requests.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">9. Fan Call Expiry</h3>
        <p className="mb-6">1. Fan Call Expiration Policy</p>
        <p className="mb-6">
          Once a creator accepts your Fan Call request, you have 10 days to start the call.
          If the call does not begin within this period, the request will automatically expire.
        </p>
        <p className="mb-6">
          No charges are made until a call officially starts, so you will not be billed for expired or missed calls.
        </p>
        <p className="mb-6">
          This ensures a smooth experience and keeps the platform free from inactive requests.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">10. Fan Meet & Fan Date Policy</h3>
        <p className="mb-6">1. Duration of Meetings</p>
        <p className="mb-6">
          All Fan Meets and Fan Dates requested through the platform are limited to a maximum of 30 minutes.
          This rule is in place to promote safety, fairness, and a casual, non-exploitative fan experience.
        </p>

        <p className="mb-6">2. Premium Extensions</p>
        <p className="mb-6">
          If both parties wish to continue after the initial session, fans may send a new structured booking
          request at the end of each date. Each extension is a separate booking with its own upfront payment
          and must be agreed upon by both parties. Neither party is under any obligation to continue.
        </p>

        <p className="mb-6">3. Location of Meetings</p>
        <p className="mb-6">
          All meetings must take place in public locations (cafes, malls, restaurants, etc.).
          Private residences, hotel rooms, or other non-public spaces are strictly prohibited
          for meetings arranged through the platform.
        </p>

        <p className="mb-6">4. Independent Activity Disclaimer</p>
        <p className="mb-6">
          The platform is not responsible for any activity or interaction that occurs outside the scope
          of the requested session. Users who extend meetings beyond 30 minutes or move to private locations
          do so at their own discretion and responsibility.
        </p>

        <p className="mb-6">5. Enforcement</p>
        <p className="mb-6">
          Violation of these rules may result in suspension or permanent removal from the platform.
          Repeated violations may also lead to further legal action if necessary to protect the platform and its users.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">11. Payment System</h3>
        <p className="mb-6">1. Fan Meet / Fan Date</p>
        <p className="mb-6">Fans must pay upfront.</p>
        <p className="mb-6">Funds are placed in a pending account (escrow).</p>
        <p className="mb-6">After the meeting/date, fans must tap "Mark as Complete."</p>
        <p className="mb-6">Once confirmed, the money is released instantly to the Creator's account.</p>

        <p className="mb-6">2. Fan Call</p>
        <p className="mb-6">Fans are charged per minute.</p>
        <p className="mb-6">The amount is deducted live from the fan's balance.</p>
        <p className="mb-6">Payment is transferred directly to the Creator's account in real time.</p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">12. Safety & Conduct</h3>
        <p className="mb-6">Creators must keep interactions respectful, safe, and legal.</p>
        <p className="mb-6">Explicit content, harassment, or illegal activity is strictly prohibited.</p>
        <p className="mb-6">Creators should not share personal contact info outside the platform.</p>
        <p className="mb-6">The platform is not responsible for off-platform activities once a meet or date occurs.</p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">13. Platform Rights</h3>
        <p className="mb-6">We may suspend or remove accounts that violate rules.</p>
        <p className="mb-6">We reserve the right to update terms and notify you of changes.</p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">14. No Employment Relationship</h3>
        <p className="mb-6">You are an independent contractor, not an employee.</p>
        <p className="mb-6">You are responsible for your own taxes and declarations.</p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">15. Liability</h3>
        <p className="mb-6">
          The platform provides a safe fan connection and payment system, but does not guarantee fan behavior.
        </p>
        <p className="mb-6">Creators are encouraged to use judgment and report unsafe users.</p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">16. Gold System & Earnings</h3>
        <p className="mb-6">
          Earnings on the platform are based on a virtual currency called Gold. All values, rates, and payouts
          are subject to the Gold Conversion Policy outlined below.
        </p>

        <p className="mb-6">1. Gold Currency System</p>
        <p className="mb-6">
          The Platform uses a virtual currency known as Gold for all fan payments and creator earnings.
          Fans purchase Gold to access paid features, including Fan Meet, Fan Date, Fan Call, and digital content.
        </p>

        <p className="mb-6">2. Gold-to-Dollar Conversion</p>
        <p className="mb-6">
          For creators, 1 Gold = $0.04 USD. This rate reflects the platform's internal valuation and
          may differ from the price fans pay when purchasing Gold.
        </p>

        <p className="mb-6">3. Revenue Share Creator</p>
        <p className="mb-6">Creators are not charged platform fees or commission on their earnings.</p>
        <p className="mb-6">This system ensures transparent earnings with no surprise deductions.</p>

        <p className="mb-6">4. Earnings & Withdrawals</p>
        <p className="mb-6">
          Creators can request a withdrawal once their account balance reaches $50 or more.
          Balances below this threshold will remain in the account until the minimum is met.
          Withdrawals are processed via USDT (BEP20 - Binance Smart Chain).
        </p>

        <p className="mb-6">5. Payout Requests</p>
        <p className="mb-6">
          Payouts must be manually requested from your dashboard. Processing may take up to 3 business days.
        </p>

        <p className="mb-6">6. Payout Methods Available</p>
        <p className="mb-6">We currently support the following withdrawal options:</p>
        <p className="mb-6">USDT (BEP20 - Binance Smart Chain)</p>
        <p className="mb-6">
          Please ensure your wallet or account details are correct before requesting a payout.
          We are not responsible for losses due to incorrect or incomplete information.
        </p>

        <p className="mb-6">7. Fees & Charges</p>
        <p className="mb-6">
          We do not charge platform fees on withdrawals. However, external fees (e.g., blockchain gas fees) may apply.
        </p>

        <p className="mb-6">8. Fraud & Abuse</p>
        <p className="mb-6">
          Any attempt to manipulate earnings or abuse the platform will result in account suspension or removal
          and forfeiture of earnings.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">17. Virtual Currency ("Gold") Policy</h3>
        <p className="mb-6">1. Definition</p>
        <p className="mb-6">
          "Gold" refers to virtual tokens used within the Platform to access features, support creators,
          and unlock premium interactions.
        </p>

        <p className="mb-6">2. Purchase Finality</p>
        <p className="mb-6">
          All purchases of Gold are final and non-refundable. Once payment is processed, no refund,
          exchange, or reversal will be issued — even if your account is later suspended or terminated.
        </p>

        <p className="mb-6">3. Usage</p>
        <p className="mb-6">
          Gold has no real-world monetary value and may not be transferred, exchanged, or converted outside the Platform.
        </p>

        <p className="mb-6">4. Technical Issues</p>
        <p className="mb-6">
          In the rare case of system errors that prevent delivery of purchased Gold, please contact Support
          within 24 hours for verification and correction.
        </p>

        <p className="mb-6">5. Fraud or Abuse</p>
        <p className="mb-6">
          The Platform reserves the right to review and revoke Gold obtained through unauthorized or fraudulent means.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">18. Content Ownership</h3>
        <p className="mb-6">
          Creators retain ownership of their content but grant us a non-exclusive license to display and
          promote it on the platform. You may not upload copyrighted or stolen content.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">19. Fees and Revenue</h3>
        <p className="mb-6">The platform is free to use. Creators keep 100% of their revenue.</p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">20. Termination</h3>
        <p className="mb-6">
          We reserve the right to suspend or terminate any account that violates our terms.
          Users can terminate their account anytime via account settings.
        </p>

        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-300">21. Dispute Resolution</h3>
        <p className="mb-6">
          In case of disputes between fans and creators, users are encouraged to contact support within
          24 hours with clear evidence (screenshots, photos, videos).
          We will act as a neutral third-party, but do not guarantee resolution outcomes.
        </p>

        <p className="mb-6">
          If a fan refuses to mark a meet/date as complete, the platform reserves the right to review
          and release payment based on on-platform chat history and evidence of attendance.
        </p>

        <p className="mb-6">
          Mmeko does not assess the quality or satisfaction of any date. Payment decisions are based
          solely on whether the meeting occurred, as verified through on-platform communication.
        </p>

        <p className="mb-6">
          False disputes or abuse of the system will result in account suspension or permanent ban.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;