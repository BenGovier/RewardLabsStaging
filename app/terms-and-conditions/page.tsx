import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms and Conditions</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Raffle Entry Terms</h2>
                <div className="space-y-3 text-gray-700">
                  <p>By entering any raffle on this platform, you agree to be bound by these terms and conditions.</p>
                  <p>
                    <strong>Eligibility:</strong> You must be 18 years or older to enter any raffle. Employees of the
                    hosting business and their immediate family members are not eligible to participate.
                  </p>
                  <p>
                    <strong>Entry Requirements:</strong> All required information must be provided accurately. False or
                    misleading information may result in disqualification.
                  </p>
                  <p>
                    <strong>One Entry Per Person:</strong> Unless otherwise specified, each person is limited to one
                    entry per raffle. Multiple entries from the same person may result in disqualification.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Winner Selection and Notification</h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Random Selection:</strong> Winners will be selected randomly from all eligible entries
                    received by the closing date.
                  </p>
                  <p>
                    <strong>Notification:</strong> Winners will be notified via the email address provided during entry
                    within 7 days of the raffle closing date.
                  </p>
                  <p>
                    <strong>Response Time:</strong> Winners must respond to notification within 14 days. Failure to
                    respond may result in forfeiture of the prize.
                  </p>
                  <p>
                    <strong>Verification:</strong> Winners may be required to provide proof of identity and eligibility
                    before receiving their prize.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Prizes and Fulfillment</h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Prize Description:</strong> Prizes are as described in the individual raffle listings. No
                    cash alternatives are available unless specifically stated.
                  </p>
                  <p>
                    <strong>Prize Delivery:</strong> Prizes will be delivered or made available for collection within 30
                    days of winner verification.
                  </p>
                  <p>
                    <strong>Taxes and Fees:</strong> Winners are responsible for any applicable taxes, duties, or fees
                    associated with their prize.
                  </p>
                  <p>
                    <strong>Prize Substitution:</strong> The hosting business reserves the right to substitute prizes of
                    equal or greater value if the original prize becomes unavailable.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Protection and Privacy</h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Data Collection:</strong> We collect personal information necessary for raffle entry and
                    prize fulfillment.
                  </p>
                  <p>
                    <strong>Data Usage:</strong> Your data will be used to process your entry, contact you if you win,
                    and deliver prizes. If you consent to marketing communications, we may also use your data to inform
                    you about future raffles and offers.
                  </p>
                  <p>
                    <strong>Data Sharing:</strong> Your personal information will be shared with the hosting business
                    for the purposes of the raffle. We do not sell your data to third parties.
                  </p>
                  <p>
                    <strong>Data Retention:</strong> Entry data will be retained for the duration of the raffle and for
                    12 months afterward for verification and legal purposes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. General Conditions</h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Raffle Cancellation:</strong> The hosting business reserves the right to cancel or modify a
                    raffle if circumstances beyond their control make it necessary.
                  </p>
                  <p>
                    <strong>Disqualification:</strong> We reserve the right to disqualify entries that violate these
                    terms or are submitted fraudulently.
                  </p>
                  <p>
                    <strong>Limitation of Liability:</strong> Our liability is limited to the value of the prize. We are
                    not responsible for technical failures, lost entries, or other issues beyond our control.
                  </p>
                  <p>
                    <strong>Governing Law:</strong> These terms are governed by the laws of the jurisdiction where the
                    hosting business is located.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Marketing Consent</h2>
                <div className="space-y-3 text-gray-700">
                  <p>If you provide marketing consent during entry, you agree to receive communications about:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Future raffles and competitions</li>
                    <li>Special offers and promotions</li>
                    <li>Product updates and announcements</li>
                    <li>Business news and updates</li>
                  </ul>
                  <p>
                    You can withdraw your marketing consent at any time by contacting the hosting business directly or
                    using unsubscribe links in communications.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    For questions about these terms or any raffle, please contact the hosting business directly through
                    the contact information provided in the raffle listing.
                  </p>
                  <p>For technical issues with the platform, please contact our support team.</p>
                </div>
              </section>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> By entering any raffle, you acknowledge that you have read, understood,
                  and agree to be bound by these terms and conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
