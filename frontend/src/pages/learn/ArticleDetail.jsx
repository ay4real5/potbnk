import { Link, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';

// Static article content keyed by slug
const ARTICLES = {
  'automating-finances': {
    title: 'Why automating your finances may be your secret weapon',
    tag: 'Savings',
    readTime: '5 min read',
    date: 'April 10, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80',
    body: [
      { type: 'p', text: 'There\'s a reason financial advisors have been preaching auto-pay and automatic savings for decades: it works. When you remove the decision from the equation, you remove the friction — and friction is exactly what causes people to delay, skip, or abandon their financial goals.' },
      { type: 'h2', text: 'The psychology of automation' },
      { type: 'p', text: 'Human beings are wired to prioritize the present over the future. When you get a paycheck, every dollar feels available. Manually transferring money to savings requires defeating that impulse every single time. Automation means you\'ve already made that decision once — and the money moves before you can talk yourself out of it.' },
      { type: 'h2', text: 'Where to start' },
      { type: 'p', text: 'Begin with your most important goal. If you don\'t have an emergency fund, start there. Set up an automatic transfer of even $50–$100 on payday to a separate high-yield savings account. Label it "Emergency Fund" so it feels purposeful, not punitive.' },
      { type: 'h2', text: 'Layering your automations' },
      { type: 'p', text: 'Once your emergency fund is on autopilot, add a second automation for your retirement account at work. Even increasing your 401(k) contribution by 1% can compound significantly over a career. Then consider automating bill payments — credit cards, utilities, subscriptions — so you never accidentally pay a late fee again.' },
      { type: 'h2', text: 'The review habit' },
      { type: 'p', text: 'Automation isn\'t "set it and forget it" — it\'s "set it and check it." Review your automations every 3–6 months to make sure amounts still make sense for your income and goals. Life changes; your setup should too.' },
    ],
    related: ['build-credit', 'inflation-savings', 'budget-rule'],
  },
  'build-credit': {
    title: 'How to build a strong credit score from scratch',
    tag: 'Credit',
    readTime: '7 min read',
    date: 'March 25, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    body: [
      { type: 'p', text: 'A strong credit score opens doors — lower interest rates, better apartments, and easier loan approvals. But building one from zero can feel circular: you need credit to get credit. Here\'s how to break that cycle.' },
      { type: 'h2', text: 'Start with a secured credit card' },
      { type: 'p', text: 'A secured card requires a cash deposit that becomes your credit limit. Use it for small, regular purchases and pay the balance in full every month. After 6–12 months of on-time payments, most issuers will upgrade you to an unsecured card and return your deposit.' },
      { type: 'h2', text: 'Become an authorized user' },
      { type: 'p', text: 'If a trusted family member or friend has excellent credit, ask to be added as an authorized user on one of their cards. Their payment history on that card becomes part of your credit file — giving your score an early boost without requiring you to spend a dollar.' },
      { type: 'h2', text: 'Pay everything on time, every time' },
      { type: 'p', text: 'Payment history is the single biggest factor in your credit score — roughly 35% of the calculation. Even one missed payment can set you back significantly. Set up autopay for at least the minimum payment on every credit account.' },
      { type: 'h2', text: 'Keep utilization below 30%' },
      { type: 'p', text: 'Credit utilization — how much of your available credit you\'re using — accounts for about 30% of your score. Keeping it below 30% (and ideally below 10%) signals responsible use to lenders.' },
    ],
    related: ['credit-report', 'automating-finances', 'budget-rule'],
  },
  'investing-basics': {
    title: 'Investing for beginners: a plain-language guide',
    tag: 'Investing',
    readTime: '9 min read',
    date: 'March 18, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    body: [
      { type: 'p', text: 'Investing can feel intimidating — full of jargon, risk, and the fear of losing money. But the basics are simple: put your money to work so it grows over time. The hardest part isn\'t choosing the right stock. It\'s starting.' },
      { type: 'h2', text: 'Why you can\'t just save your way to wealth' },
      { type: 'p', text: 'A savings account earning 0.5% APY loses ground against inflation every year. Historically, a diversified stock market portfolio has returned around 7–10% annually over long periods. That difference compounds dramatically over decades.' },
      { type: 'h2', text: 'Start with index funds' },
      { type: 'p', text: 'An index fund tracks a broad market index — like the S&P 500 — and owns a tiny piece of hundreds of companies at once. Low fees, instant diversification, and no need to pick individual winners. Most financial experts recommend index funds as the starting point for new investors.' },
      { type: 'h2', text: 'Use tax-advantaged accounts first' },
      { type: 'p', text: 'Before opening a standard brokerage account, max out tax-advantaged accounts: your employer\'s 401(k) (at least enough to capture any match — that\'s free money), then a Roth IRA if you\'re eligible. These accounts let your investments grow tax-free or tax-deferred.' },
      { type: 'h2', text: 'The power of time, not timing' },
      { type: 'p', text: 'You can\'t reliably predict when the market will rise or fall — and neither can the experts. What you can control is consistency. Invest a fixed amount every month regardless of market conditions. This "dollar-cost averaging" means you automatically buy more shares when prices are low.' },
    ],
    related: ['automating-finances', 'fire-movement', 'micro-investing'],
  },
  'inflation-savings': {
    title: 'What the latest inflation report means for your savings',
    tag: 'Savings',
    readTime: '4 min read',
    date: 'April 3, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&q=80',
    body: [
      { type: 'p', text: 'Inflation measures how quickly prices rise across the economy. When it\'s high, the purchasing power of every dollar you hold falls. If your savings account earns less than the inflation rate, your money is effectively shrinking — even as the number on your statement grows.' },
      { type: 'h2', text: 'The real return on your savings' },
      { type: 'p', text: 'The "real" return on any savings account is the stated interest rate minus inflation. At 3% inflation and a 0.5% savings rate, your real return is -2.5%. High-yield savings accounts and money market funds that keep up with — or beat — inflation can make a meaningful difference.' },
      { type: 'h2', text: 'Where to move your cash' },
      { type: 'p', text: 'For money you need within the next 1–2 years, look for high-yield savings accounts or short-term Treasury bills. For longer time horizons, consider I-bonds (which adjust with inflation) or a short-duration bond fund. The key is not to let large cash balances sit in low-yield accounts.' },
      { type: 'h2', text: 'Don\'t overreact' },
      { type: 'p', text: 'Inflation is a long-term factor to plan around — not a signal to make panicked moves. Maintain your emergency fund in liquid savings, even if the real return is slightly negative. The cost of not having accessible cash in a crisis is far higher than a few percentage points of purchasing power.' },
    ],
    related: ['automating-finances', 'budget-rule', 'emergency-fund'],
  },
  'home-buying-costs': {
    title: 'Hidden costs to budget for when buying a home',
    tag: 'Home Buying',
    readTime: '8 min read',
    date: 'February 28, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
    body: [
      { type: 'p', text: 'The listing price is just the beginning. First-time buyers are routinely caught off guard by the true cost of purchasing a home — and those surprise expenses can create financial stress right when you\'re most stretched.' },
      { type: 'h2', text: 'Closing costs' },
      { type: 'p', text: 'Closing costs typically run 2–5% of the loan amount and include lender origination fees, title insurance, escrow fees, prepaid property taxes, and homeowner\'s insurance. On a $400,000 home, that\'s $8,000–$20,000 due at closing — in addition to your down payment.' },
      { type: 'h2', text: 'Inspection, appraisal, and moving' },
      { type: 'p', text: 'A thorough home inspection costs $300–$600 and is non-negotiable. The lender will require an appraisal ($500–$800). Then add moving costs — $1,500–$5,000 for local moves, more for long distance — and immediate purchases like appliances, window treatments, and furniture.' },
      { type: 'h2', text: 'Ongoing ownership costs' },
      { type: 'p', text: 'Once you own a home, your monthly costs go beyond the mortgage. Budget for property taxes, homeowner\'s insurance, HOA fees (if applicable), and maintenance. A widely cited rule of thumb: set aside 1% of the home\'s value per year for repairs and maintenance.' },
      { type: 'h2', text: 'Build a homeownership reserve' },
      { type: 'p', text: 'Before closing, aim to have 3–6 months of mortgage payments saved beyond your down payment and closing costs. This buffer protects you from the financial shock of a major repair — like a roof replacement or HVAC failure — in the first few years of ownership.' },
    ],
    related: ['budget-rule', 'automating-finances', 'emergency-fund'],
  },
  'small-business-financing': {
    title: 'Small business financing: what are your real options?',
    tag: 'Business',
    readTime: '11 min read',
    date: 'February 12, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&q=80',
    body: [
      { type: 'p', text: 'Financing a small business means navigating dozens of options — each with different costs, requirements, and trade-offs. Understanding the landscape before you apply saves time, protects your credit, and helps you choose a structure that actually fits your business.' },
      { type: 'h2', text: 'SBA loans' },
      { type: 'p', text: 'Small Business Administration (SBA) loans are partially guaranteed by the federal government, which means lenders take on less risk and can offer lower interest rates. The 7(a) loan — up to $5 million — is the most common. The trade-off: the application process is thorough and can take weeks.' },
      { type: 'h2', text: 'Business lines of credit' },
      { type: 'p', text: 'A line of credit lets you draw and repay funds as needed, up to a set limit. It\'s ideal for managing cash flow gaps — covering payroll between invoices, for example — rather than one-time large purchases. Interest accrues only on the amount drawn.' },
      { type: 'h2', text: 'Equipment financing and invoice factoring' },
      { type: 'p', text: 'Equipment loans use the equipment itself as collateral, making them easier to qualify for. Invoice factoring lets you sell unpaid invoices to a lender for immediate cash at a small discount — useful for businesses with long payment cycles but solid clients.' },
      { type: 'h2', text: 'Know your numbers before you apply' },
      { type: 'p', text: 'Lenders will scrutinize your personal credit score, business revenue, time in business, and debt-service coverage ratio. Get your documentation in order — tax returns, bank statements, a profit/loss statement — before approaching any lender.' },
    ],
    related: ['build-credit', 'budget-rule', 'automating-finances'],
  },
  'budget-rule': {
    title: 'The 50/30/20 budget rule: does it actually work?',
    tag: 'Savings',
    readTime: '6 min read',
    date: 'January 30, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&q=80',
    body: [
      { type: 'p', text: 'The 50/30/20 rule is simple: spend 50% of after-tax income on needs, 30% on wants, and put 20% toward savings and debt repayment. Senator Elizabeth Warren popularized it in her book "All Your Worth." But does simplicity make it right for everyone?' },
      { type: 'h2', text: 'Why it works as a starting point' },
      { type: 'p', text: 'Most budgeting systems fail because they\'re too granular. Tracking 40 spending categories is unsustainable. The 50/30/20 rule gives you three buckets — clear enough to follow, flexible enough to adapt. It also forces an honest look at what\'s truly a "need" versus a "want."' },
      { type: 'h2', text: 'Where it breaks down' },
      { type: 'p', text: 'In high cost-of-living cities, housing and transportation alone can eat 50% or more of income. The rule was designed for average incomes and average costs. If your needs genuinely exceed 50%, the answer isn\'t to fudge the categories — it\'s to look for ways to reduce fixed costs.' },
      { type: 'h2', text: 'Adapting the framework' },
      { type: 'p', text: 'If 20% savings isn\'t achievable right now, start with 10% and increase it by 1% every few months as you adjust spending. The exact numbers matter less than the habit. Consistently saving something — and automatically — beats an optimized budget you abandon after two weeks.' },
    ],
    related: ['automating-finances', 'inflation-savings', 'emergency-fund'],
  },
  'credit-report': {
    title: 'Understanding your credit report: a practical walkthrough',
    tag: 'Credit',
    readTime: '10 min read',
    date: 'January 15, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
    body: [
      { type: 'p', text: 'Your credit report is a detailed record of your borrowing history — and most people have never read it. Yet it shapes your ability to get approved for loans, rent apartments, and sometimes even get hired. Knowing what\'s in yours is non-negotiable.' },
      { type: 'h2', text: 'How to get your report for free' },
      { type: 'p', text: 'You\'re entitled to one free credit report per year from each of the three major bureaus — Equifax, Experian, and TransUnion — via AnnualCreditReport.com. Spacing them out (every four months) lets you monitor your credit year-round for free.' },
      { type: 'h2', text: 'What to look for' },
      { type: 'p', text: 'Check for accounts you don\'t recognize, incorrect personal information, and late payments that were actually on time. Errors are more common than you\'d expect. The Consumer Financial Protection Bureau estimates that one in five Americans has an error on at least one credit report.' },
      { type: 'h2', text: 'How to dispute errors' },
      { type: 'p', text: 'To dispute an error, contact the credit bureau reporting it directly — in writing if possible. Include copies of any documentation that supports your claim. Bureaus are required to investigate and respond within 30 days. Keep records of everything.' },
      { type: 'h2', text: 'The five factors that make up your score' },
      { type: 'p', text: 'Payment history (35%), amounts owed (30%), length of credit history (15%), new credit inquiries (10%), and credit mix (10%). The first two dominate — so pay on time and keep balances low.' },
    ],
    related: ['build-credit', 'fraud-protection', 'automating-finances'],
  },
  'fire-movement': {
    title: 'FIRE: what "retiring early" actually requires',
    tag: 'Investing',
    readTime: '8 min read',
    date: 'April 14, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    body: [
      { type: 'p', text: 'FIRE — Financial Independence, Retire Early — is a movement built around one idea: save and invest aggressively enough that your portfolio generates enough passive income to cover your expenses, so work becomes optional. The math is real. The sacrifices are real too.' },
      { type: 'h2', text: 'The 25x rule and 4% withdrawal rate' },
      { type: 'p', text: 'The FIRE target is typically 25 times your annual expenses. If you spend $50,000 a year, you need $1.25 million invested. This is based on historical research showing you can withdraw 4% annually from a diversified portfolio and not run out of money over a 30-year retirement — the "4% rule."' },
      { type: 'h2', text: 'The savings rate is everything' },
      { type: 'p', text: 'Time to FIRE is almost entirely determined by your savings rate — not your income. Someone saving 50% of their income reaches FIRE in roughly 17 years from any starting point. Saving 70% gets there in about 8.5 years. The lever isn\'t earning more; it\'s keeping the gap wide between income and spending.' },
      { type: 'h2', text: 'Lean FIRE vs. Fat FIRE vs. Barista FIRE' },
      { type: 'p', text: 'Lean FIRE means retiring on a minimal budget (under $40,000/year). Fat FIRE targets a comfortable lifestyle ($100,000+). Barista FIRE — perhaps the most practical — means reaching partial financial independence and covering basic expenses through part-time work while investments keep compounding.' },
    ],
    related: ['investing-basics', 'micro-investing', 'retirement-prep'],
  },
  'micro-investing': {
    title: 'Micro-investing: small steps, big goals',
    tag: 'Investing',
    readTime: '5 min read',
    date: 'March 8, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80',
    body: [
      { type: 'p', text: '"I don\'t have enough money to start investing" is one of the most common — and most expensive — beliefs about personal finance. Micro-investing platforms let you start with as little as $1, turning small regular contributions into a meaningful portfolio over time.' },
      { type: 'h2', text: 'How round-up investing works' },
      { type: 'p', text: 'Several apps round up everyday purchases to the nearest dollar and invest the difference automatically. Spend $3.60 on coffee and $0.40 goes into an investment account. It sounds trivial — but behavioral research shows this "found money" framing leads to consistent investing that people wouldn\'t otherwise do.' },
      { type: 'h2', text: 'The compounding math' },
      { type: 'p', text: 'Investing $50 a month starting at age 25, earning 7% annually, produces roughly $130,000 by age 65. Starting at 35 with the same amount produces about $60,000. The decade\'s head start is worth more than $70,000. Compounding rewards starting early more than it rewards starting big.' },
      { type: 'h2', text: 'Micro-investing vs. real investing' },
      { type: 'p', text: 'Micro-investing is a habit-building gateway, not a retirement plan. Once you\'ve built the habit and have income to deploy, graduate to a Roth IRA or taxable brokerage account. The psychology you\'ve built — invest automatically, don\'t watch daily — transfers perfectly.' },
    ],
    related: ['investing-basics', 'automating-finances', 'fire-movement'],
  },
  'retirement-prep': {
    title: 'Planning for retirement at any age',
    tag: 'Retirement',
    readTime: '8 min read',
    date: 'February 5, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=1200&q=80',
    body: [
      { type: 'p', text: 'Retirement planning isn\'t something you do at 55 and check off a list. It\'s a multi-decade process that looks different in your 20s, 40s, and 60s. The earlier you start, the less you need to save — because compounding does more of the heavy lifting.' },
      { type: 'h2', text: 'In your 20s and 30s: build the foundation' },
      { type: 'p', text: 'Open a Roth IRA and contribute the annual maximum if possible ($7,000 in 2026). Contribute at least enough to your 401(k) to get your full employer match. At this stage, time is your most valuable asset — don\'t trade it for current consumption.' },
      { type: 'h2', text: 'In your 40s: accelerate and assess' },
      { type: 'p', text: 'Run the numbers. Use a retirement calculator to estimate whether you\'re on track. If you\'re behind, this is the decade to close the gap — contributions can go up, lifestyle inflation can be tamed. Consider working with a fee-only financial planner for a full picture.' },
      { type: 'h2', text: 'In your 50s and beyond: de-risk and plan income' },
      { type: 'p', text: 'Gradually shift toward a more conservative asset allocation. Think about income sources in retirement: Social Security timing (delaying to 70 maximizes your benefit), required minimum distributions from tax-deferred accounts, and whether you\'ll need long-term care insurance.' },
    ],
    related: ['investing-basics', 'fire-movement', 'automating-finances'],
  },
  'emergency-fund': {
    title: 'The importance of an emergency fund',
    tag: 'Savings',
    readTime: '5 min read',
    date: 'January 20, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80',
    body: [
      { type: 'p', text: 'An emergency fund is the single most important financial safety net you can build. Without it, any unexpected expense — a car repair, a medical bill, a job loss — gets paid with high-interest debt. With it, you absorb shocks without derailing everything else.' },
      { type: 'h2', text: 'How much to save' },
      { type: 'p', text: 'The standard guidance is 3–6 months of essential living expenses. If your income is variable, you\'re self-employed, or you have dependents, aim for the higher end. Start with a $1,000 starter fund if 3 months feels overwhelming — it covers most common emergencies.' },
      { type: 'h2', text: 'Where to keep it' },
      { type: 'p', text: 'Your emergency fund should be liquid and boring. A high-yield savings account is ideal — it earns more than a standard savings account while remaining instantly accessible. Don\'t invest it in the stock market. The point is certainty, not growth.' },
      { type: 'h2', text: 'Building it faster' },
      { type: 'p', text: 'Automate a fixed transfer to your emergency fund on every payday. Treat it like a bill. Any windfall — tax refund, bonus, gift money — should flow here first until it\'s fully funded. Once your emergency fund is solid, redirect those same automations toward investing.' },
    ],
    related: ['automating-finances', 'budget-rule', 'inflation-savings'],
  },
  'estate-planning': {
    title: 'Estate planning essentials everyone should know',
    tag: 'Planning',
    readTime: '9 min read',
    date: 'March 1, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    body: [
      { type: 'p', text: 'Estate planning isn\'t just for the wealthy. Anyone with assets, dependents, or strong preferences about their own medical care needs a basic estate plan. Without one, state law decides what happens to your money and who raises your children.' },
      { type: 'h2', text: 'The four core documents' },
      { type: 'p', text: 'A complete basic estate plan includes: a will (distributes assets, names a guardian for minor children), a durable power of attorney (designates someone to manage finances if you\'re incapacitated), a healthcare proxy (designates a medical decision-maker), and an advance directive/living will (documents your treatment preferences).' },
      { type: 'h2', text: 'Beneficiary designations override your will' },
      { type: 'p', text: 'Retirement accounts, life insurance policies, and bank accounts with a "POD" (payable on death) designation pass directly to the named beneficiary — regardless of what your will says. Review beneficiary designations after every major life event: marriage, divorce, birth, death.' },
      { type: 'h2', text: 'When to involve a professional' },
      { type: 'p', text: 'Simple estates can be handled with online tools at low cost. But if you have a blended family, a business, a taxable estate, or complex wishes, an estate planning attorney is worth the investment. The cost of not getting it right is typically borne by the people you love most.' },
    ],
    related: ['retirement-prep', 'fraud-protection', 'budget-rule'],
  },
  'cybersecurity': {
    title: 'Cybersecurity best practices for your finances',
    tag: 'Security',
    readTime: '6 min read',
    date: 'April 7, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    body: [
      { type: 'p', text: 'Financial accounts are among the highest-value targets for cybercriminals. A single compromised credential can lead to drained bank accounts, fraudulent loans, and months of recovery. Basic cybersecurity hygiene dramatically reduces your risk.' },
      { type: 'h2', text: 'Use a password manager' },
      { type: 'p', text: 'Reusing passwords is the single biggest security mistake people make. A password manager generates and stores unique, complex passwords for every account — you only remember one master password. Enable two-factor authentication (2FA) on every financial account, using an authenticator app rather than SMS where possible.' },
      { type: 'h2', text: 'Recognize phishing attempts' },
      { type: 'p', text: 'Phishing emails mimic your bank, the IRS, or a popular brand to steal your credentials. Red flags: urgency ("your account will be suspended"), generic greetings, mismatched sender domains, and links that don\'t go where they appear to. When in doubt, go directly to the website — never click links in unsolicited emails.' },
      { type: 'h2', text: 'Freeze your credit' },
      { type: 'p', text: 'A credit freeze prevents new credit from being opened in your name — even if someone has your Social Security number. It\'s free, doesn\'t affect your existing accounts or credit score, and can be temporarily lifted when you\'re applying for new credit. It\'s the most powerful tool against identity theft.' },
    ],
    related: ['fraud-protection', 'credit-report', 'build-credit'],
  },
  'jobs-report': {
    title: 'What the latest jobs report means for you',
    tag: 'Economy',
    readTime: '4 min read',
    date: 'April 5, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80',
    body: [
      { type: 'p', text: 'The monthly jobs report — formally the Employment Situation from the Bureau of Labor Statistics — is one of the most watched economic indicators in the world. Markets move on it. The Federal Reserve cites it. And it has very real effects on your finances.' },
      { type: 'h2', text: 'What the report actually measures' },
      { type: 'p', text: 'The headline number is net job gains or losses across the economy. Below the headline: the unemployment rate, labor force participation rate, average hourly earnings, and revisions to prior months. Wage growth is particularly important — it\'s a leading indicator of both consumer spending and inflation.' },
      { type: 'h2', text: 'How it affects interest rates' },
      { type: 'p', text: 'A strong jobs report often puts upward pressure on interest rates, because it suggests the economy can handle tighter monetary policy. That means mortgage rates, auto loan rates, and credit card APRs can shift in the weeks following a report. Timing a refinance or large purchase around this data can pay off.' },
      { type: 'h2', text: 'What it means for your career' },
      { type: 'p', text: 'A tightening labor market — falling unemployment, rising wages — gives workers more leverage to negotiate salary, change jobs, or land better offers. Conversely, a weakening labor market is a signal to build your emergency fund and stay current on in-demand skills.' },
    ],
    related: ['inflation-savings', 'retirement-prep', 'budget-rule'],
  },
  'student-loan-debt': {
    title: 'Navigating student loan debt: a practical guide',
    tag: 'Loans',
    readTime: '8 min read',
    date: 'March 12, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
    body: [
      { type: 'p', text: 'Student loan debt is the largest category of consumer debt after mortgages. If you\'re carrying a balance, it\'s not just a financial burden — it can delay homeownership, retirement saving, and financial independence by years. Understanding your options is the first step to taking control.' },
      { type: 'h2', text: 'Know what you owe and to whom' },
      { type: 'p', text: 'Federal loans and private loans have very different rules. Federal loans offer income-driven repayment plans, deferment, forbearance, and forgiveness programs. Private loans typically don\'t. Log into StudentAid.gov for a complete federal loan picture, and check your credit report for any private loans.' },
      { type: 'h2', text: 'Income-driven repayment (IDR) plans' },
      { type: 'p', text: 'IDR plans cap your monthly federal loan payment at 5–10% of your discretionary income. Any remaining balance is forgiven after 20–25 years. If your loan balance is large relative to your income, an IDR plan can dramatically reduce monthly payments — freeing cash for other financial goals.' },
      { type: 'h2', text: 'Refinancing trade-offs' },
      { type: 'p', text: 'Refinancing federal loans with a private lender can reduce your interest rate — but permanently surrenders your access to IDR plans, Public Service Loan Forgiveness, and federal deferment options. It makes financial sense only if you have high-interest loans, a stable income, and no plans to use federal protections.' },
    ],
    related: ['build-credit', 'budget-rule', 'emergency-fund'],
  },
  'fraud-protection': {
    title: 'Protecting yourself from financial fraud',
    tag: 'Security',
    readTime: '6 min read',
    date: 'March 22, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80',
    body: [
      { type: 'p', text: 'Financial fraud costs Americans billions of dollars every year — and the most effective schemes don\'t require sophisticated hacking. They exploit trust, urgency, and the natural human desire to avoid confrontation. Knowing the playbook is your best defense.' },
      { type: 'h2', text: 'The most common scams' },
      { type: 'p', text: 'Impersonation scams (someone pretending to be your bank, the IRS, or Social Security) account for more losses than any other fraud category. The core mechanic is always the same: create fear or excitement, demand immediate action, and provide a "safe" way to transfer money (gift cards, wire transfers, cryptocurrency) that can\'t be reversed.' },
      { type: 'h2', text: 'The golden rule' },
      { type: 'p', text: 'No legitimate bank, government agency, or business will ever ask you to pay with gift cards, wire money to a "safe account," or share your full account number, Social Security number, or one-time passcode over the phone or by email. Ever. If you feel pressure to act immediately, that\'s the tell.' },
      { type: 'h2', text: 'What to do if you\'ve been targeted' },
      { type: 'p', text: 'If you transferred money, contact your bank immediately — within hours if possible. Report the fraud to the FTC at ReportFraud.ftc.gov and the FBI\'s IC3.gov. Place a fraud alert or credit freeze with the credit bureaus. Document everything: call logs, emails, receipts.' },
    ],
    related: ['cybersecurity', 'credit-report', 'build-credit'],
  },
  'cryptocurrency': {
    title: 'Understanding cryptocurrency: what it is and what to know',
    tag: 'Investing',
    readTime: '7 min read',
    date: 'February 20, 2026',
    author: 'Hunch Editorial Team',
    img: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&q=80',
    body: [
      { type: 'p', text: 'Cryptocurrency is digital money secured by cryptography and recorded on a decentralized network called a blockchain. Unlike dollars, no central bank issues it or backs it. Bitcoin, Ethereum, and thousands of other coins exist purely because people assign them value — which makes them unlike any asset class before them.' },
      { type: 'h2', text: 'What blockchain actually does' },
      { type: 'p', text: 'A blockchain is a shared ledger replicated across thousands of computers. Every transaction is verified by the network and permanently recorded. No single entity controls it. This eliminates the need for trusted intermediaries — banks, clearinghouses — for certain types of transactions.' },
      { type: 'h2', text: 'The risk profile' },
      { type: 'p', text: 'Crypto is among the most volatile asset classes in existence. Bitcoin has lost 50–80% of its value multiple times in its history — and recovered. Most altcoins have not recovered from major drawdowns. Scams and hacks are endemic. These aren\'t reasons to avoid it entirely, but they\'re reasons to treat it as speculation, not savings.' },
      { type: 'h2', text: 'If you decide to invest' },
      { type: 'p', text: 'Only invest what you could afford to lose entirely. Use a regulated, established exchange (not obscure platforms promising outsized yields). Consider a Bitcoin or Ethereum ETF in a standard brokerage account rather than holding crypto directly — it removes the risk of lost wallet keys or exchange failures.' },
    ],
    related: ['investing-basics', 'micro-investing', 'fraud-protection'],
  },
};

const RELATED_ARTICLES = {
  'automating-finances':    { title: 'Why automating your finances may be your secret weapon', tag: 'Savings' },
  'build-credit':           { title: 'How to build a strong credit score from scratch', tag: 'Credit' },
  'investing-basics':       { title: 'Investing for beginners: a plain-language guide', tag: 'Investing' },
  'inflation-savings':      { title: 'What the latest inflation report means for your savings', tag: 'Savings' },
  'home-buying-costs':      { title: 'Hidden costs to budget for when buying a home', tag: 'Home Buying' },
  'small-business-financing': { title: 'Small business financing: what are your real options?', tag: 'Business' },
  'budget-rule':            { title: 'The 50/30/20 budget rule: does it actually work?', tag: 'Savings' },
  'credit-report':          { title: 'Understanding your credit report: a practical walkthrough', tag: 'Credit' },
  'fire-movement':          { title: 'FIRE: what "retiring early" actually requires', tag: 'Investing' },
  'micro-investing':        { title: 'Micro-investing: small steps, big goals', tag: 'Investing' },
  'retirement-prep':        { title: 'Planning for retirement at any age', tag: 'Retirement' },
  'emergency-fund':         { title: 'The importance of an emergency fund', tag: 'Savings' },
  'estate-planning':        { title: 'Estate planning essentials everyone should know', tag: 'Planning' },
  'cybersecurity':          { title: 'Cybersecurity best practices for your finances', tag: 'Security' },
  'jobs-report':            { title: 'What the latest jobs report means for you', tag: 'Economy' },
  'student-loan-debt':      { title: 'Navigating student loan debt: a practical guide', tag: 'Loans' },
  'fraud-protection':       { title: 'Protecting yourself from financial fraud', tag: 'Security' },
  'cryptocurrency':         { title: 'Understanding cryptocurrency: what it is and what to know', tag: 'Investing' },
};

export default function ArticleDetail() {
  const { slug } = useParams();
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <PageShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
          <h1 className="text-4xl font-black text-bank-dark mb-4">Article not found</h1>
          <p className="text-gray-500 text-sm mb-8">We couldn't find that article. Try browsing all resources below.</p>
          <Link to="/learn" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Browse All Articles
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Hero image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={article.img} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bank-dark/80" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-3xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bank-dark bg-[#4ade80] px-2.5 py-1 rounded-sm">
            {article.tag}
          </span>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white mt-3 leading-snug">{article.title}</h1>
        </div>
      </div>

      {/* Article body */}
      <article className="bg-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-10 pb-6 border-b border-gray-100">
            <span>{article.author}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>

          {/* Body content */}
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
            {article.body.map((block, i) => {
              if (block.type === 'h2') {
                return <h2 key={i} className="text-xl font-bold text-bank-dark mt-10 mb-4">{block.text}</h2>;
              }
              return <p key={i} className="mb-5 leading-relaxed">{block.text}</p>;
            })}
          </div>

          {/* Soft CTA */}
          <div className="mt-12 bg-bank-surface rounded-2xl p-8">
            <p className="text-bank-accent text-xs font-bold uppercase tracking-widest mb-2">Ready to take action?</p>
            <h3 className="text-xl font-bold text-bank-dark mb-3">Put these tips to work with Hunch.</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Open an account in minutes and start building financial habits that last.
            </p>
            <Link to="/open-account" className="inline-flex items-center gap-2 bg-bank-dark hover:bg-bank-mid text-white font-bold px-7 py-3 rounded-full transition-colors text-sm">
              Open an Account
            </Link>
          </div>
        </div>
      </article>

      {/* Related articles */}
      {article.related && article.related.length > 0 && (
        <section className="bg-bank-surface py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-bank-dark mb-6">Keep reading</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {article.related.map((slug) => {
                const rel = RELATED_ARTICLES[slug];
                if (!rel) return null;
                return (
                  <Link
                    key={slug}
                    to={`/learn/${slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group block"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm">
                      {rel.tag}
                    </span>
                    <p className="text-sm font-semibold text-bank-dark mt-3 mb-3 leading-snug group-hover:text-bank-accent transition-colors">
                      {rel.title}
                    </p>
                    <p className="text-xs text-bank-accent font-semibold group-hover:underline">Read →</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
