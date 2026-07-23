the clicks count seems to be doubling on each click. please check and rectify.



Implement Growth Partner referral tracking while preserving the existing enrollment workflow.
on the saleslanding page or the other enroll page, do the referral code capturing and submission.

### Goal

Do **not** create a new enrollment or payment approval flow. The system already has an enrollment process that should remain unchanged.

### Referral Capture

* Read the `ref` query parameter from the sales page URL (e.g. `?ref=PARTNER123`).
* Store the referral code in component state when the page loads.
* If no referral code is present, continue with the normal sales flow.

### Lead Submission

Update the existing `handleSubmit()` function so that when a lead is created via `/sales-leads`, it also sends:

* `referralCode`
* `leadSource` (`growth_partner` if a referral code exists, otherwise `direct`)

The referral code should be stored with the lead record.

### Sales Lead Model

Extend the Sales Lead model to support referral tracking by adding fields such as:

* `referralCode`
* `leadSource`

Do not modify existing fields unless necessary.

### Existing Enrollment Flow

Keep the current enrollment workflow exactly as it is.

When a lead eventually becomes enrolled through the existing system, the enrollment should automatically retain the referral relationship from the original lead.

### Growth Partner Attribution

When an enrollment is completed through the existing workflow:

* Check whether the originating lead has a `referralCode`.
* If it does, associate that enrollment with the corresponding Growth Partner.
* Record that this student was referred by that partner.
* Ensure this enrollment can be used later for commission calculations and reporting.

Do **not** create commission records when the lead is submitted. A lead is only a lead, that is you cunt it as lead for the partner. Commissions and partner credit should only occur after the student has successfully completed the existing enrollment process.

### Important

* Do not change the current Paystack Shop payment flow.
* Do not introduce a new payment confirmation process.
* Do not create a parallel enrollment workflow.
* The only new responsibility is capturing and preserving referral information from the sales page through to the existing enrollment process so that enrolled students can be attributed to the correct Growth Partner.
