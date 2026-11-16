export const affiliateTerms = [
  [
    "How it works",
    "Invite someone to MyTikLink with your referral link. When they make a qualifying paid subscription purchase, you earn a reward. Signing up alone does not earn a reward."
  ],
  [
    "Who can join",
    "You must be at least 18, legally able to accept these terms, and have a MyTikLink account in good standing. Please use your correct details, including your payment information."
  ],
  [
    "Getting started",
    "Read these terms and click Accept and activate to start using your referral link. Joining is free. We save the date and version of the terms you accepted."
  ],
  [
    "When a referral counts",
    "The person you invite needs to register within 30 days after clicking your referral link for you to be eligible for rewards from their qualifying purchases. If they click another valid referral link before registering, the most recent valid link counts. If they enter a valid referral code themselves, that code takes priority. Once they register, their referrer cannot be changed. If they switch devices or clear their browser cookies, the referral may not be recorded."
  ],
  [
    "Purchases that qualify",
    "Rewards apply only to genuine subscription payments that MyTikLink has successfully verified. Free plans, failed or pending payments, cancelled payments, refunds and reversed payments do not qualify."
  ],
  [
    "Your first reward",
    "For the first qualifying purchase by someone you refer, you earn ₦200 for Standard Monthly, ₦1,000 for Pro Monthly, ₦2,000 for Standard Yearly, or ₦8,000 for Pro Yearly. The plan they pay for determines your reward. We keep a record of the rate that applied when you earned it."
  ],
  [
    "Rewards after the first purchase",
    "For each qualifying renewal or upgrade after the first purchase, you earn ₦100 for Standard Monthly, ₦500 for Pro Monthly, ₦1,000 for Standard Yearly, or ₦4,000 for Pro Yearly. The plan paid for in that transaction determines the reward. Changing plans does not earn another first-purchase reward. Each verified payment earns one reward only."
  ],
  [
    "When your reward becomes available",
    "Rewards are normally held for 14 days before they become available to withdraw. This gives us time to verify the payment and check for refunds or misuse. A reward may take longer if it needs review. Any updated holding period applies according to the terms recorded for that reward."
  ],
  [
    "Refunds and reversed payments",
    "If a purchase is refunded, reversed or found to be invalid, the reward for that purchase will be cancelled. If it has already been paid to you, we may recover that amount from future earnings or seek repayment where permitted by law. We keep a record of these adjustments."
  ],
  [
    "Self-referrals and manipulation",
    "Do not refer yourself, create duplicate accounts to earn rewards, arrange fake purchases, or manipulate the referral system in any other way. If we confirm this behaviour, rewards connected to the misuse will be cancelled, and your account or participation may be suspended. Sharing a device or internet connection alone does not prove misuse. You can contact support if you believe a decision is wrong."
  ],
  [
    "Sharing your link responsibly",
    "Share your link honestly. Do not spam people, pretend to be MyTikLink, promise guaranteed earnings, or advertise discounts we have not offered. Make it clear that rewards depend on qualifying paid subscriptions. Follow applicable laws and the rules of the platforms you use. Do not send unsolicited bulk messages, harass referrals, sell their contact details, share referral information with third parties, or use it for unrelated marketing. Only contact a referral on WhatsApp when they have authorised it, and stop if they withdraw permission."
  ],
  [
    "Your account and bank details",
    "Keep your account secure and your details up to date. We verify Nigerian bank account names through our payment provider. Incorrect details, name mismatches or reused bank accounts may need further review. Only provide banking information you are authorised to use."
  ],
  [
    "Withdrawing your earnings",
    "You can request a withdrawal when your available earnings reach ₦5,000. Pending rewards cannot be withdrawn. Once you request a withdrawal, that amount is reserved so it cannot be requested again while we process it."
  ],
  [
    "How payouts are handled",
    "We review withdrawal requests before paying them. Approval means your request has passed review; it does not mean the money has already reached your bank. We record a payout as paid after confirming the transfer. If a request fails or is rejected, the reserved amount becomes available again unless a lawful hold applies. We do not promise a fixed processing time."
  ],
  [
    "Taxes and lawful deductions",
    "You are responsible for taxes that apply to your earnings. Where the law requires MyTikLink to withhold tax or make another lawful deduction, we may do so and keep the relevant records. Any other deduction must be lawful and disclosed."
  ],
  [
    "Pausing or ending participation",
    "You can stop participating at any time. We may pause referrals, rewards or withdrawals, or end participation, for security, fraud or legal reasons. We may also close the program. A pause or closure does not automatically cancel valid rewards you have already earned. Contact support if you need a decision reviewed."
  ],
  [
    "Changes to the program",
    "MyTikLink may change future reward rates, eligibility, holding periods or withdrawal rules, or pause or end the program, subject to applicable law. We will provide any notice required by law. Valid rewards earned before a change remain payable under the terms that applied when they were earned, subject to payment verification, refunds, fraud checks and lawful deductions."
  ],
  [
    "Cash rewards and future credits",
    "If we introduce platform credits for future rewards, we will state the rules clearly. Cash rewards you have already earned will not quietly be changed into credits that you cannot withdraw. Credit-only rewards are not currently active."
  ],
  [
    "Your records and information",
    "We keep the referral, payment and review records needed to run the program, resolve disputes and meet legal obligations. Access is restricted, and your information is handled under our privacy policy and applicable Nigerian law."
  ],
  [
    "Questions, mistakes and disputes",
    "If a referral, reward or payout looks wrong, email support@mytiklink.com with the relevant reference. We will check the records and explain the outcome. These terms are governed by Nigerian law and do not take away rights or remedies the law gives you, or exclude liability that cannot legally be excluded. Never send your password or verification code to support."
  ]
];
export function termsForRates(rates){
 if(!rates)return affiliateTerms;
 const plans=[['standard_monthly','Standard Monthly'],['pro_monthly','Pro Monthly'],['standard_yearly','Standard Yearly'],['pro_yearly','Pro Yearly']];
 const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n/100);
 return affiliateTerms.map(([title,text])=>[title,title==='Your first reward'?'For the first qualifying purchase by someone you refer, you earn '+plans.map(([key,name])=>money(rates[key])+' for '+name).join(', ')+'. We keep the rate and rule version recorded when you earn it.':title==='Rewards after the first purchase'?'For each qualifying renewal or upgrade after the first purchase, you earn '+plans.map(([key,name])=>money(rates['subsequent_'+key]??rates.subsequent??0)+' for '+name).join(', ')+'. The plan paid for in that transaction determines your reward. Changing plans does not earn another first-purchase reward. Each verified payment earns one reward only.':text]);
}
