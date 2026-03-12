import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const QUESTIONS = [
  // SECTION 1: INVESTMENTS
  {id:1, section:"Investments", type:"mc", q:"A company purchases bonds and intends to hold them until they mature. How should this investment be classified?", opts:["Trading securities","Available-for-sale securities","Held-to-maturity securities","Equity method investment"], ans:[2], pts:1},
  {id:2, section:"Investments", type:"mc", q:"Which investment classification reports unrealized gains/losses in Net Income?", opts:["HTM","Trading","AFS","Both HTM and AFS"], ans:[1], pts:1},
  {id:3, section:"Investments", type:"mc", q:"Where do unrealized gains and losses on Available-for-Sale securities appear?", opts:["Net Income","Other Comprehensive Income (OCI) / AOCI","They are not recognized until sold","Retained Earnings directly"], ans:[1], pts:1},
  {id:4, section:"Investments", type:"mc", q:"At what value are Held-to-Maturity securities reported on the balance sheet?", opts:["Fair value","Amortized cost","Original purchase price with no adjustments","Lower of cost or market"], ans:[1], pts:1},
  {id:5, section:"Investments", type:"mc", q:"A company holds Trading securities purchased for $50,000. At year-end, fair value is $53,000. What is the effect on pre-tax net income?", opts:["$0","+$3,000","-$3,000","Depends on whether they were sold"], ans:[1], explain:"Trading securities mark to fair value through net income regardless of whether sold.", pts:1},
  {id:6, section:"Investments", type:"mc", q:"Same facts as above, but the securities are classified as AFS. What is the effect on pre-tax net income?", opts:["$0","+$3,000","-$3,000","+$3,000 in OCI"], ans:[0], explain:"$0 on net income. The $3,000 unrealized gain goes to OCI.", pts:1},
  {id:7, section:"Investments", type:"mc", q:"When an AFS security is actually sold, where does the realized gain or loss appear?", opts:["OCI only","Net income","It was already recognized, so nowhere new","Retained earnings directly"], ans:[1], explain:"It gets 'recycled' from AOCI into net income upon sale.", pts:1},
  {id:8, section:"Investments", type:"tf", q:"True or False: HTM securities are affected on the income statement by changes in market interest rates during the holding period.", ans:false, explain:"HTM is carried at amortized cost; market rate changes don't affect carrying value or income statement.", pts:1},

  // SECTION 2: STATEMENT OF CASH FLOWS
  {id:9, section:"Cash Flows", type:"matching", q:"Order the following in terms of how they appear on the Statement of Cash Flows (top to bottom):", pairs:[{label:"First",answer:"Operating Cash Flows"},{label:"Second",answer:"Investing Cash Flows"},{label:"Third",answer:"Financing Cash Flows"},{label:"Fourth",answer:"Additional Information"}], options:["Operating Cash Flows","Investing Cash Flows","Financing Cash Flows","Additional Information"], pts:1},
  {id:10, section:"Cash Flows", type:"matching", q:"Classify the following as financing, investing, or operating transactions:", pairs:[{label:"Issue/sell stock to shareholders",answer:"Financing"},{label:"Purchasing PP&E with cash",answer:"Investing"},{label:"Making a cash sale to customers",answer:"Operating"}], options:["Operating","Investing","Financing"], pts:1},
  {id:11, section:"Cash Flows", type:"mc", q:"Which of these is a common way to calculate free cash flow?", opts:["Dividends paid + Stock Buybacks - Interest Expense","Net Income + Income Tax Expense","Cash from operating activities - Net Capital Expenditures","Cash from operating activities - Net payments to shareholders"], ans:[2], pts:1},
  {id:12, section:"Cash Flows", type:"multi", q:"Which of the following are Investing Cash Flows? (Select all that apply)", opts:["Capital Expenditures","Depreciation","Cash proceeds from selling PP&E","Cash received from customers","Cash proceeds from issuing stock","Acquisitions of businesses","Interest paid to credit investors (lenders)"], ans:[0,2,5], explain:"Depreciation is non-cash. Customer receipts = Operating. Stock issuance = Financing. Interest paid = Operating.", pts:1},
  {id:13, section:"Cash Flows", type:"mc", q:"A higher quick ratio indicates which of the following?", opts:["The firm has taken on too much debt","The firm has enough cash and near-cash assets to cover near-term liabilities","The firm is holding too much inventory","The firm's stock is overvalued"], ans:[1], pts:1},
  {id:14, section:"Cash Flows", type:"fill", q:"Quick ratio formula: (Cash + A/R + Marketable Securities) / Current Liabilities.\n\nGiven: Cash $200, A/R $300, Inventory $500, Marketable Securities $100, Current Liabilities $400.\n\nWhat is the quick ratio?", ans:"1.5", pts:1},
  {id:15, section:"Cash Flows", type:"mc", q:"On the indirect method CFO section, if Accounts Receivable increased during the period, you:", opts:["Add the increase","Subtract the increase","Ignore it","Record it as investing"], ans:[1], explain:"An increase in A/R means you earned revenue but didn't collect cash yet.", pts:1},
  {id:16, section:"Cash Flows", type:"mc", q:"Depreciation expense is added back in the operating section of the SCF (indirect method) because:", opts:["Depreciation generates cash","It was subtracted in net income but is non-cash","It belongs in investing activities","It increases assets"], ans:[1], pts:1},
  {id:17, section:"Cash Flows", type:"mc", q:"A company shows: Net Income slightly negative but improving, CFO negative but improving, CFI large and negative, CFF large and positive. What lifecycle stage is the company in?", opts:["Decline","Turnaround","Mature","Growth"], ans:[3], explain:"Funding heavy investment with external financing while operations haven't yet caught up.", pts:1},

  // SECTION 3: STOCKHOLDERS' EQUITY
  {id:18, section:"Stockholders' Equity", type:"mc", q:"Changes in equity can be decomposed into changes in contributed capital and changes in:", opts:["Cash and cash equivalents","Common stock","Depreciation and amortization","Retained earnings"], ans:[3], pts:1},
  {id:19, section:"Stockholders' Equity", type:"fill_multi", q:"A hospitality company issued 10 shares of stock at $8/share. Par value is $0.10/share.\n\nWrite the net effect on each account (use - for negatives, 0 for no effect):", fields:[{label:"Cash",ans:"80"},{label:"Common Stock",ans:"1"},{label:"Additional Paid-in Capital",ans:"79"},{label:"Retained Earnings",ans:"0"},{label:"Operating Cash Flows",ans:"0"},{label:"Financing Cash Flows",ans:"80"},{label:"Pre-tax Net Income",ans:"0"}], pts:3},
  {id:20, section:"Stockholders' Equity", type:"fill_multi", q:"Same company issues 10 shares at $8/share, but the stock is NO-PAR.\n\nWrite the net effect on each account:", fields:[{label:"Cash",ans:"80"},{label:"Common Stock",ans:"80"},{label:"Additional Paid-in Capital",ans:"0"},{label:"Retained Earnings",ans:"0"},{label:"Financing Cash Flows",ans:"80"},{label:"Pre-tax Net Income",ans:"0"}], pts:2},
  {id:21, section:"Stockholders' Equity", type:"fill_multi", q:"A company with 15,000 shares outstanding declared and paid a $0.02 dividend.\n\nWrite the net effect on each account:", fields:[{label:"Cash",ans:"-300"},{label:"Common Stock",ans:"0"},{label:"APIC",ans:"0"},{label:"Retained Earnings",ans:"-300"},{label:"Operating Cash Flows",ans:"0"},{label:"Financing Cash Flows",ans:"-300"},{label:"Pre-tax Net Income",ans:"0"}], pts:2, explain:"Dividends hit Retained Earnings and are a financing cash flow, NOT operating."},
  {id:22, section:"Stockholders' Equity", type:"fill_multi", q:"Pay $120 to repurchase the company's shares that were originally issued for $20.\n\nWrite the net effect on each account:", fields:[{label:"Cash",ans:"-120"},{label:"Total Assets",ans:"-120"},{label:"Common Stock",ans:"0"},{label:"Treasury Stock (only the amount)",ans:"120"},{label:"Total Equity",ans:"-120"},{label:"Pretax income",ans:"0"},{label:"Operating cash flows",ans:"0"},{label:"Financing cash flows",ans:"-120"}], pts:2.5},
  {id:23, section:"Stockholders' Equity", type:"fill_multi", q:"RapidGro reissued 100 shares out of its Treasury Stock account for $12 per share. The shares had previously been repurchased for an average price of $8.\n\nWhat is the effect of the reissuance on:", fields:[{label:"Common Stock",ans:"0"},{label:"APIC",ans:"400"}], pts:2, explain:"The $4/share excess × 100 shares goes to APIC. Treasury stock transactions NEVER hit the income statement."},
  {id:24, section:"Stockholders' Equity", type:"fill", q:"A transportation company reissued 35 shares out of its Treasury Stock account for $10 per share. The shares had previously been repurchased for an average price of $8.60.\n\nWhat is the effect of the reissuance of treasury shares on the firm's pre-tax income (net income ignoring taxes)?", ans:"0", explain:"Treasury stock transactions are equity transactions — they bypass the income statement entirely.", pts:0.5},

  // SECTION 4: BONDS
  {id:25, section:"Bonds", type:"mc", q:"A bond is issued at par. Over its life, what happens to its book value?", opts:["Increases toward face value","Decreases toward face value","Stays constant at face value","Fluctuates with market rates"], ans:[2], explain:"No amortization when coupon rate = effective rate.", pts:1},
  {id:26, section:"Bonds", type:"fill_multi", q:"A company retires a bond with book value (NBV) of $92K by paying $100K cash.\n\nComplete:", fields:[{label:"Gain or Loss amount (use - for loss)",ans:"-8000"},{label:"Cash flow classification of the $100K",ans:"Financing"}], explain:"Loss = $100K paid − $92K book value = $8K loss. Cash outflow is financing. The $8K loss hits the income statement but gets added back in CFO.", pts:1},
  {id:27, section:"Bonds", type:"mc", q:"Interest payments on bonds are classified as which type of cash flow under US GAAP?", opts:["Operating","Investing","Financing"], ans:[0], explain:"Principal repayment and issuance proceeds are Financing, but interest is Operating.", pts:1},
  {id:28, section:"Bonds", type:"mc", q:"For a discount bond using amortized cost, interest expense each period is:", opts:["Coupon rate × Face value","Effective rate × Beginning book value","Coupon rate × Book value","Market rate × Face value"], ans:[1], pts:1},

  // SECTION 5: FOUNDATIONS
  {id:29, section:"Foundations", type:"mc", q:"Which of these is the accounting equation?", opts:["Assets + Equity = Liabilities","Assets = Liabilities + Equity","Liabilities - Assets = Equity","Assets + Liabilities = Equity"], ans:[1], pts:0.25},
  {id:30, section:"Foundations", type:"mc", q:"What are the accounting rules for US public companies called?", opts:["US GAAP","International Financial Reporting Standards","Global Accounting Advanced Practices","American Accounting Standards"], ans:[0], pts:0.25},
  {id:31, section:"Foundations", type:"mc", q:"A current asset is one that is:", opts:["A small berry (i.e., a currant asset)","Up to date","Either cash or expected to yield cash within a year","Recently acquired"], ans:[2], pts:0.25},
  {id:32, section:"Foundations", type:"mc", q:"A non-current liability is one that is:", opts:["Contributed capital","Long-lasting, like land","Expected to be paid after a year or more","Retained earnings"], ans:[2], pts:0.25},
  {id:33, section:"Foundations", type:"mc", q:"Under LIFO in a period of rising prices, compared to FIFO:", opts:["COGS is higher, Net Income is lower, Ending Inventory is lower","COGS is lower, Net Income is higher, Ending Inventory is higher","No difference","COGS is higher, Net Income is higher"], ans:[0], pts:1},
  {id:34, section:"Foundations", type:"mc", q:"IPR&D (In-Process Research & Development) acquired in a business combination is:", opts:["Always expensed immediately","Capitalized as an intangible asset","Ignored","Recorded as goodwill"], ans:[1], explain:"If acquired outside a business combination, it's expensed unless it has alternative future use.", pts:1},
  {id:35, section:"Foundations", type:"fill_multi", q:"Examine the Allowance for Credit Losses note:\n\nBalance beginning of period: 106.6\nCharged to costs and expenses: 8.7\nCharge-offs, net of recoveries: (38.7)\nBalance end of period: 76.6\nGross A/R: 1,378.6", fields:[{label:"How much did credit customers owe SBD (gross A/R)?",ans:"1378.6"},{label:"How much did SBD expect NOT to collect from new credit sales?",ans:"8.7"},{label:"Net amount written off as uncollectible?",ans:"38.7"}], pts:3},

  // SECTION 6: SVB CASE
  {id:36, section:"SVB Case", type:"mc", q:"Silicon Valley Bank's core risk management failure was:", opts:["Investing in junk bonds with high default risk","Funding long-term fixed-rate bond investments with short-term deposits, creating a duration mismatch","Using the equity method for all investments","Failing to issue enough stock to cover losses"], ans:[1], pts:1},
  {id:37, section:"SVB Case", type:"mc", q:"SVB reclassified bond investments from AFS to HTM. The primary accounting effect was:", opts:["Unrealized losses were recognized immediately in net income","Unrealized losses no longer appeared on the face of the financial statements","The bonds were written down to zero","Interest income stopped being recognized"], ans:[1], explain:"HTM is at amortized cost, so ~$15B in unrealized losses disappeared from the face of the statements. Still disclosed in footnotes.", pts:1},
  {id:38, section:"SVB Case", type:"tf", q:"True or False: SVB's unrealized losses on HTM securities were completely invisible to investors.", ans:false, explain:"Companies must disclose fair value of HTM securities in the notes. The info was there — investors just didn't look.", pts:1},
  {id:39, section:"SVB Case", type:"mc", q:"SVB's equity was ~$16B and unrealized losses on HTM securities were ~$15B. If those losses were realized, the bank would:", opts:["Still have a healthy equity cushion","Be near-zero equity, triggering a bank run","Have negative liabilities","Need to reclassify to AFS"], ans:[1], pts:1},

  // SECTION 7: DIVIDENDS
  {id:40, section:"Dividends & Income", type:"matching", q:"Nike holds shares of GE. GE pays Nike a $1,000 dividend. Record the effects:", pairs:[{label:"Cash",answer:"+1,000"},{label:"Dividend Income (I/S)",answer:"+1,000"},{label:"Cash Flow Classification",answer:"Operating"}], options:["+1,000","0","-1,000","Operating","Financing","Investing"], pts:1},
  {id:41, section:"Dividends & Income", type:"mc", q:"Nike declares and pays dividends to its own shareholders. The effect on pre-tax net income is:", opts:["+$50M","-$50M","$0","Depends on the dividend amount"], ans:[2], explain:"Dividends declared are NOT an expense. They do NOT hit the income statement. They reduce Retained Earnings and are a Financing cash flow.", pts:1},
  {id:42, section:"Dividends & Income", type:"mc", q:"A company declares a $2M dividend in Q4 but doesn't pay until Q1. In Q4:", opts:["Cash -$2M, Retained Earnings -$2M","Dividends Payable +$2M, Retained Earnings -$2M, no cash effect","No accounting entry until cash is paid","Retained Earnings -$2M, APIC -$2M"], ans:[1], explain:"This is why dividends on the Statement of SE (declared) can differ from the SCF (paid).", pts:1},

  // SECTION 8: CF CLASSIFICATION
  {id:43, section:"Cash Flows", type:"matching", q:"Classify each cash flow as Operating, Investing, or Financing:", pairs:[{label:"Interest received on a bond investment",answer:"Operating"},{label:"Dividends received from equity investment",answer:"Operating"},{label:"Cash proceeds from selling a bond investment",answer:"Investing"},{label:"Cash paid to purchase an equity investment",answer:"Investing"}], options:["Operating","Investing","Financing"], explain:"Interest and dividend income are Operating even though they come from investments — US GAAP rule.", pts:1},
  {id:44, section:"Cash Flows", type:"mc", q:"Nike sells a bond investment (book value $500K) for $545K. The $45K realized gain shows up in:", opts:["The income statement only","The cash flow statement only","Both — gain on I/S, full $545K proceeds as investing CF","Neither — it stays in OCI"], ans:[2], pts:1},

  // SECTION 9: SHARES & SPLITS
  {id:45, section:"Stockholders' Equity", type:"matching", q:"Match each term to its definition:", pairs:[{label:"Authorized shares",answer:"Maximum shares the company can legally issue"},{label:"Issued shares",answer:"Shares that have been sold/distributed at some point"},{label:"Outstanding shares",answer:"Issued shares currently held by outside investors"},{label:"Treasury shares",answer:"Issued shares bought back, removed from circulation"}], options:["Maximum shares the company can legally issue","Shares that have been sold/distributed at some point","Issued shares currently held by outside investors","Issued shares bought back, removed from circulation"], pts:1},
  {id:46, section:"Stockholders' Equity", type:"mc", q:"A company has 100M authorized shares, 60M issued, and 5M in treasury. How many shares are outstanding?", opts:["100M","60M","55M","95M"], ans:[2], pts:1},
  {id:47, section:"Stockholders' Equity", type:"multi", q:"After a 2-for-1 stock split, which of the following change? (Select all that apply)", opts:["Number of shares outstanding (doubles)","Price per share (halves)","Par value per share (halves, if state allows)","Total stockholders' equity","Total market capitalization"], ans:[0,1,2], explain:"Total equity and market cap are unchanged — stock splits have no economic substance.", pts:1},
  {id:48, section:"Stockholders' Equity", type:"mc", q:"A stock split typically signals:", opts:["The company is in financial distress","Management confidence that the price will grow back toward the pre-split range","The company is about to issue new debt","Earnings per share will permanently double"], ans:[1], explain:"A reverse split signals weakness (often to avoid delisting below $1).", pts:1},

  // SECTION 10: EPS & P/E
  {id:49, section:"Ratios Deep Dive", type:"mc", q:"Basic EPS is calculated as:", opts:["Net Income / Shares Authorized","(Net Income − Preferred Dividends) / Weighted Average Shares Outstanding","Net Income / Ending Shares Outstanding","EBIT / Total Shares Issued"], ans:[1], pts:1},
  {id:50, section:"Ratios Deep Dive", type:"mc", q:"The denominator uses weighted average shares outstanding rather than year-end shares because:", opts:["It's required by tax law","The number of shares changes throughout the year, and weighting reflects each period's actual share count","It makes the number larger","Outstanding shares are confidential at year-end"], ans:[1], pts:1},
  {id:51, section:"Ratios Deep Dive", type:"mc", q:"Diluted EPS is always ______ basic EPS.", opts:["Greater than","Less than or equal to","Equal to","Unrelated to"], ans:[1], explain:"Diluted assumes all potentially dilutive securities convert to common, increasing the denominator.", pts:1},
  {id:52, section:"Ratios Deep Dive", type:"mc", q:"A stock trades at $60/share with EPS of $4. The P/E ratio is:", opts:["4","15","240","0.067"], ans:[1], explain:"$60 / $4 = 15. Investors pay $15 for every $1 of current earnings.", pts:1},

  // SECTION 11: DUPONT & QUALITY
  {id:53, section:"Ratios Deep Dive", type:"mc", q:"The DuPont decomposition of ROE is:", opts:["Net Income / Revenue × Revenue / Equity","(Net Income / Sales) × (Sales / Assets) × (Assets / Equity)","EBIT / Total Assets × Total Assets / Revenue","Gross Profit / Sales × Sales / Equity"], ans:[1], explain:"= Profit Margin × Asset Turnover × Financial Leverage", pts:1},
  {id:54, section:"Earnings Quality", type:"mc", q:"Which of the following best indicates high earnings quality?", opts:["Net income significantly exceeds CFO","CFO is approximately equal to or greater than net income","The company has large accrual adjustments each period","A/R is growing much faster than revenue"], ans:[1], pts:1},

  // SECTION 12: CF RECONCILIATION
  {id:55, section:"Cash Flows", type:"mc", q:"Cash collected from customers equals:", opts:["Revenue + Increase in A/R + Increase in Deferred Revenue","Revenue − Increase in A/R + Increase in Unearned Revenue","Revenue + Decrease in A/R − Increase in Unearned Revenue","COGS − Increase in Inventory"], ans:[1], pts:1},
  {id:56, section:"Cash Flows", type:"mc", q:"Cash paid to suppliers equals:", opts:["COGS − Increase in Inventory + Increase in A/P","Revenue + Increase in Inventory − Decrease in A/P","COGS + Increase in Inventory + Decrease in A/P","COGS + Decrease in Inventory + Increase in A/P"], ans:[2], pts:1},

  // SECTION 13: SUPPLY CHAIN
  {id:57, section:"Foundations", type:"mc", q:"In supply chain financing, the accounting concern is:", opts:["Revenue is being recognized too early","The buyer keeps showing 'accounts payable' instead of 'bank debt,' effectively hiding leverage","The supplier is overstating inventory","Interest expense is being capitalized"], ans:[1], pts:1},

  // SECTION 14: EQUITY METHOD
  {id:58, section:"Investments", type:"fill_multi", q:"A company owns 30% of another company. The investee reports $10M net income, then pays $1M in dividends to the investor.\n\nPart (a): When investee reports $10M net income:\nPart (b): When investee pays $1M dividend:", fields:[{label:"(a) Investment account change",ans:"3000000"},{label:"(a) Income statement effect",ans:"3000000"},{label:"(b) Cash",ans:"1000000"},{label:"(b) Investment account change",ans:"-1000000"},{label:"(b) Income statement effect",ans:"0"}], explain:"Under the equity method, dividends received REDUCE the investment — they are NOT income.", pts:2},

  // SECTION 15: REVENUE RECOGNITION
  {id:59, section:"Foundations", type:"mc", q:"Revenue is recognized when:", opts:["Cash is received from the customer","The contract is signed","The performance obligation is satisfied (goods/services delivered)","The invoice is mailed"], ans:[2], pts:1},
  {id:60, section:"Foundations", type:"mc", q:"Customers pay $10K for gift cards. At the time of purchase, the company records:", opts:["Revenue +$10K","Cash +$10K, Deferred Revenue +$10K (liability)","Cash +$10K, Retained Earnings +$10K","A/R +$10K, Revenue +$10K"], ans:[1], explain:"Revenue not earned until gift cards redeemed.", pts:1},

  // SECTION 16: ANALYSIS
  {id:61, section:"Foundations", type:"mc", q:"Horizontal analysis compares:", opts:["Line items as a percentage of revenue within one period","Financial data across multiple time periods (year-over-year)","A company's ratios to industry averages","Cash flows to net income"], ans:[1], pts:1},
  {id:62, section:"Foundations", type:"mc", q:"In a common-size (vertical) income statement, each line item is expressed as a percentage of:", opts:["Total assets","Net income","Revenue","Total equity"], ans:[2], pts:1},

  // SECTION 17: DEPRECIATION & PPE
  {id:63, section:"PP&E / Intangibles", type:"matching", q:"Match each depreciation method to its description:", pairs:[{label:"Straight-line",answer:"Equal expense each period"},{label:"Declining balance",answer:"Higher expense in early years (accelerated)"},{label:"Units-of-production",answer:"Expense based on actual usage or output"}], options:["Equal expense each period","Higher expense in early years (accelerated)","Expense based on actual usage or output"], pts:1},
  {id:64, section:"PP&E / Intangibles", type:"mc", q:"A company sells PP&E with a net book value of $30K for $25K cash. The result is:", opts:["Gain of $5K","Loss of $5K","No gain or loss","Gain of $25K"], ans:[1], pts:1},
  {id:65, section:"PP&E / Intangibles", type:"multi", q:"An asset impairment results in: (Select all that apply)", opts:["A write-down of the asset on the balance sheet","An impairment loss on the income statement","A cash outflow","An add-back in CFO under the indirect method (non-cash charge)"], ans:[0,1,3], explain:"There is NO cash effect.", pts:1},

  // SECTION 18: INTANGIBLES
  {id:66, section:"PP&E / Intangibles", type:"matching", q:"Match each intangible type to its accounting treatment:", pairs:[{label:"Finite-life (patents, licenses)",answer:"Amortized over useful life"},{label:"Indefinite-life (trademarks)",answer:"Not amortized; tested annually for impairment"},{label:"Goodwill",answer:"Not amortized; tested for impairment; never written back up"},{label:"Internal R&D",answer:"Expensed as incurred (US GAAP)"}], options:["Amortized over useful life","Not amortized; tested annually for impairment","Not amortized; tested for impairment; never written back up","Expensed as incurred (US GAAP)"], pts:1},
  {id:67, section:"PP&E / Intangibles", type:"mc", q:"Goodwill can only arise from:", opts:["Internal development","A business combination (acquisition)","Purchasing a patent","Stock buybacks"], ans:[1], pts:1},

  // SECTION 19: WARRANTY
  {id:68, section:"Foundations", type:"fill_multi", q:"A company estimates $1K in future warranty costs at the time of a sale. Later, $800 in actual warranty claims occur.\n\nPart (a): At time of sale (estimate):\nPart (b): When $800 in claims occur:", fields:[{label:"(a) Warranty Liability",ans:"1000"},{label:"(a) Warranty Expense (I/S)",ans:"1000"},{label:"(a) Cash",ans:"0"},{label:"(b) Warranty Liability",ans:"-800"},{label:"(b) Inventory or Cash",ans:"-800"},{label:"(b) Income Statement effect",ans:"0"}], explain:"Expense recognized at time of sale. When claims happen, it's just settling the liability — no additional income statement effect.", pts:2},

  // SECTION 20: BONDS COMPUTATIONAL
  {id:69, section:"Bonds", type:"mc", q:"A 2-year, 5% coupon, $1,000 face value bond is issued at par. Annual interest expense is:", opts:["$50","$100","$0 — par bonds don't have interest expense","It varies each year due to amortization"], ans:[0], pts:1},
  {id:70, section:"Bonds", type:"mc", q:"A zero-coupon bond, face value $1,000, is issued for $907.03 with effective rate ~5%. Year 1 interest expense is:", opts:["$50.00","$45.35","$0 — no coupons means no interest","$92.97"], ans:[1], explain:"$907.03 × 5% = $45.35. No cash payment — all expense increases book value.", pts:1},
  {id:71, section:"Bonds", type:"mc", q:"Over the life of a discount bond, book value:", opts:["Stays flat at face value","Increases toward face value","Decreases toward face value","Fluctuates with market rates"], ans:[1], pts:1},
  {id:72, section:"Bonds", type:"tf", q:"True or False: After issuance, changes in market interest rates affect a bond's book value under amortized cost accounting.", ans:false, explain:"Effective rate is locked in at issuance. Market rate changes have NO effect.", pts:1},
  {id:73, section:"Bonds", type:"fill_multi", q:"A company issues a $50,000 face bond at $48,000 (discount). Effective rate 6%, coupon rate 5%.\n\nComplete Year 1:", fields:[{label:"Interest Expense",ans:"2880"},{label:"Coupon Payment",ans:"2500"},{label:"Discount Amortization",ans:"380"},{label:"Ending Book Value",ans:"48380"}], pts:2},
  {id:74, section:"Bonds", type:"matching", q:"From the issuer's perspective, classify each bond-related cash flow:", pairs:[{label:"Bond issuance proceeds",answer:"Financing inflow"},{label:"Coupon interest payments",answer:"Operating outflow"},{label:"Principal repayment at maturity",answer:"Financing outflow"}], options:["Operating outflow","Financing inflow","Financing outflow","Investing outflow"], pts:1},

  // SECTION 21: NPV
  {id:75, section:"Bonds", type:"mc", q:"The present value of $105 received one year from now at a 5% discount rate is:", opts:["$105.00","$110.25","$100.00","$99.75"], ans:[2], pts:1},
  {id:76, section:"Bonds", type:"mc", q:"Higher risk leads to a ______ discount rate, which results in a ______ present value.", opts:["Lower; higher","Higher; lower","Higher; higher","Lower; lower"], ans:[1], pts:1},

  // SECTION 22: ACCRUAL CONCEPTS
  {id:77, section:"Foundations", type:"matching", q:"Match each concept to its definition:", pairs:[{label:"Accounts Receivable",answer:"Amounts owed TO the company by customers"},{label:"Accounts Payable",answer:"Amounts owed BY the company to suppliers"},{label:"Deferred Revenue",answer:"Cash received before earning it (liability)"},{label:"Accrued Expense",answer:"Expense recognized before cash is paid (liability)"},{label:"Prepaid Expense",answer:"Cash paid before recognizing the expense (asset)"}], options:["Amounts owed TO the company by customers","Amounts owed BY the company to suppliers","Cash received before earning it (liability)","Expense recognized before cash is paid (liability)","Cash paid before recognizing the expense (asset)"], pts:1},
  {id:78, section:"Foundations", type:"mc", q:"The matching principle requires:", opts:["Cash inflows and outflows to occur in the same period","Expenses to be recognized in the same period as the revenues they help generate","Assets and liabilities to always be equal","All transactions to be recorded at fair value"], ans:[1], pts:1},
  {id:79, section:"Foundations", type:"mc", q:"The retained earnings formula is:", opts:["Ending RE = Beginning RE + Dividends − Net Income","Ending RE = Beginning RE + Net Income − Dividends Declared","Ending RE = Revenue − Expenses","Ending RE = Total Assets − Total Liabilities"], ans:[1], pts:1},

  // SECTION 23: FINANCIAL STATEMENTS OVERVIEW
  {id:80, section:"Foundations", type:"matching", q:"Match each financial statement to what it shows:", pairs:[{label:"Balance Sheet",answer:"Assets, liabilities, and equity at a point in time"},{label:"Income Statement",answer:"Revenues and expenses over a period, resulting in net income"},{label:"Statement of Cash Flows",answer:"How cash changed over a period (CFO, CFI, CFF)"},{label:"Statement of Stockholders' Equity",answer:"How equity changed over a period (NI, dividends, issuances, buybacks, OCI)"}], options:["Assets, liabilities, and equity at a point in time","Revenues and expenses over a period, resulting in net income","How cash changed over a period (CFO, CFI, CFF)","How equity changed over a period (NI, dividends, issuances, buybacks, OCI)"], pts:1},
  {id:81, section:"Foundations", type:"mc", q:"Net income from the income statement flows into which line on the Statement of Stockholders' Equity?", opts:["Common Stock","APIC","Retained Earnings","Treasury Stock"], ans:[2], pts:1},
  {id:82, section:"Foundations", type:"mc", q:"The change in cash on the balance sheet is explained by:", opts:["The income statement","The statement of stockholders' equity","The statement of cash flows (CFO + CFI + CFF)","The notes to the financial statements"], ans:[2], pts:1},

  // SECTION 24: CLASSIFICATIONS
  {id:83, section:"Foundations", type:"multi", q:"Which of the following are current assets? (Select all that apply)", opts:["Cash","Accounts Receivable","Inventory","PP&E","Goodwill","Prepaid Expenses","Marketable Securities"], ans:[0,1,2,5,6], pts:1},
  {id:84, section:"Foundations", type:"multi", q:"Which of the following are components of Stockholders' Equity? (Select all that apply)", opts:["Common Stock (par value)","Additional Paid-in Capital","Retained Earnings","Accounts Payable","Accumulated Other Comprehensive Income","Treasury Stock (contra-equity)"], ans:[0,1,2,4,5], pts:1},
  {id:85, section:"Foundations", type:"mc", q:"On the income statement, items appear in this order (top to bottom):", opts:["Net Income → EBIT → Gross Profit → Revenue","Revenue → Gross Profit → Operating Income → EBT → Net Income → EPS","COGS → Revenue → Net Income → Gross Profit","Operating Expenses → Revenue → Gross Profit → Net Income"], ans:[1], pts:1},

  // SECTION 25: ACCRUAL ACCOUNTING
  {id:86, section:"Foundations", type:"mc", q:"The primary reason we use accrual accounting instead of cash-basis is:", opts:["Cash accounting is illegal","Accrual recognizes revenue when earned and expenses when incurred, providing a better measure of economic performance","Accrual accounting is simpler","Cash accounting overstates profits"], ans:[1], pts:1},

  // SECTION 26: TANGIBLE VS INTANGIBLE
  {id:87, section:"PP&E / Intangibles", type:"multi", q:"Which statements are true? (Select all that apply)", opts:["PP&E is depreciated; finite-life intangibles are amortized","Land is never depreciated","Goodwill is amortized over 20 years","Internal R&D is expensed as incurred under US GAAP","Goodwill can only arise from a business combination","Impairment applies to both tangible and intangible assets"], ans:[0,1,3,4,5], explain:"Goodwill is NOT amortized — it's tested for impairment.", pts:1},

  // SECTION 27: BOND BOOK VALUE
  {id:88, section:"Bonds", type:"mc", q:"A discount bond was issued two years ago. No new issuance or repayment has occurred, yet the book value has increased. This is because:", opts:["Market interest rates have fallen","The discount is being amortized — interest expense exceeds coupon payment, and the difference increases book value","The company made additional investments","Goodwill was added to the bond"], ans:[1], pts:1},

  // SECTION 28: INVESTMENT SUMMARY
  {id:89, section:"Investments", type:"matching", q:"For each investment classification, where do unrealized gains/losses appear?", pairs:[{label:"HTM (Debt)",answer:"Not recognized"},{label:"Trading (Debt or Equity)",answer:"Net Income"},{label:"AFS (Debt)",answer:"OCI / AOCI"}], options:["Not recognized","Net Income","OCI / AOCI","Retained Earnings"], pts:1},

  // SECTION 29: SE TRANSACTION EFFECTS
  {id:90, section:"Stockholders' Equity", type:"matching", q:"For each transaction, what is the effect on Total Equity?", pairs:[{label:"Issue common stock",answer:"Increases"},{label:"Declare a dividend",answer:"Decreases"},{label:"Buy treasury stock",answer:"Decreases"},{label:"Report net income",answer:"Increases"},{label:"Stock split",answer:"No change"}], options:["Increases","Decreases","No change"], pts:1},

  // SECTION 30: EARNINGS QUALITY
  {id:91, section:"Earnings Quality", type:"mc", q:"Which ratio best assesses earnings quality?", opts:["Current Ratio","P/E Ratio","CFO / Net Income","Debt / Equity"], ans:[2], explain:"Should be ≥ 1.0 for high-quality earnings.", pts:1},
  {id:92, section:"Earnings Quality", type:"multi", q:"Which of the following are red flags for earnings quality? (Select all that apply)", opts:["Net income growing while CFO is flat or declining","A/R growing much faster than revenue","CFO consistently exceeding net income","Large recurring non-cash add-backs inflating gap between NI and CFO"], ans:[0,1,3], explain:"CFO exceeding net income is actually a positive sign.", pts:1},

  // SECTION 31: RATIOS
  {id:93, section:"Ratios Deep Dive", type:"matching", q:"Match each ratio to its formula:", pairs:[{label:"Current Ratio",answer:"Current Assets / Current Liabilities"},{label:"Quick Ratio",answer:"(Cash + A/R + Mkt Securities) / Current Liabilities"},{label:"Leverage (D/E)",answer:"Total Liabilities / Total Equity"},{label:"Interest Coverage (TIE)",answer:"EBIT / Interest Expense"},{label:"ROA",answer:"Net Income / Total Assets"},{label:"ROE",answer:"Net Income / Total Equity"},{label:"Asset Turnover",answer:"Revenue / Total Assets"},{label:"Free Cash Flow",answer:"CFO − CapEx"}], options:["Current Assets / Current Liabilities","(Cash + A/R + Mkt Securities) / Current Liabilities","Total Liabilities / Total Equity","EBIT / Interest Expense","Net Income / Total Assets","Net Income / Total Equity","Revenue / Total Assets","CFO − CapEx"], pts:2},
  {id:94, section:"Ratios Deep Dive", type:"mc", q:"A company has EBIT of $500K and interest expense of $100K. The interest coverage ratio is:", opts:["0.2x","5.0x","50x","$400K"], ans:[1], pts:1},
  {id:95, section:"Ratios Deep Dive", type:"mc", q:"Company A has A/R Turnover of 12. Company B has A/R Turnover of 6. Which collects receivables faster?", opts:["Company A (Days A/R ≈ 30 days)","Company B (Days A/R ≈ 61 days)","They're the same","Cannot be determined"], ans:[0], pts:1},
  {id:96, section:"Ratios Deep Dive", type:"fill", q:"Calculate the cash-to-cash cycle:\nDays Inventory = 45, Days A/R = 30, Days A/P = 20", ans:"55", explain:"45 + 30 − 20 = 55 days", pts:1},
  {id:97, section:"Ratios Deep Dive", type:"mc", q:"When a company issues new equity, what happens to leverage and current ratio?", opts:["Leverage increases, current ratio increases","Leverage decreases, current ratio increases","Leverage decreases, current ratio decreases","Both stay the same"], ans:[1], explain:"Equity up → leverage (L/E) down. Cash up → current ratio (CA/CL) up.", pts:1},

  // RATIOS DEEP DIVE — PART A: FORMULA MATCHING
  {id:98, section:"Ratios Deep Dive", type:"matching", q:"Match each ratio to its formula:", pairs:[{label:"Current Ratio",answer:"Current Assets / Current Liabilities"},{label:"Quick Ratio",answer:"(Cash + A/R + Marketable Securities) / Current Liabilities"},{label:"Leverage (D/E)",answer:"Total Liabilities / Total Equity"},{label:"Financial Leverage (DuPont)",answer:"Total Assets / Total Equity"},{label:"Interest Coverage (TIE)",answer:"EBIT / Interest Expense"},{label:"ROA",answer:"Net Income / Total Assets"},{label:"ROE",answer:"Net Income / Total Equity"},{label:"Net Profit Margin",answer:"Net Income / Revenue"},{label:"Gross Margin",answer:"Gross Profit / Revenue"},{label:"Asset Turnover",answer:"Revenue / Total Assets"}], options:["Current Assets / Current Liabilities","(Cash + A/R + Marketable Securities) / Current Liabilities","Total Liabilities / Total Equity","Total Assets / Total Equity","EBIT / Interest Expense","Net Income / Total Assets","Net Income / Total Equity","Net Income / Revenue","Gross Profit / Revenue","Revenue / Total Assets"], pts:2},
  {id:99, section:"Ratios Deep Dive", type:"matching", q:"Match each efficiency ratio to its formula:", pairs:[{label:"A/R Turnover",answer:"Revenue / A/R"},{label:"Days A/R",answer:"365 / A/R Turnover"},{label:"Inventory Turnover",answer:"COGS / Inventory"},{label:"Days Inventory",answer:"365 / Inventory Turnover"},{label:"A/P Turnover",answer:"COGS / A/P"},{label:"Days A/P",answer:"365 / A/P Turnover"},{label:"Cash-to-Cash Cycle",answer:"Days Inventory + Days A/R − Days A/P"},{label:"Fixed Asset Turnover",answer:"Revenue / PP&E net"}], options:["Revenue / A/R","365 / A/R Turnover","COGS / Inventory","365 / Inventory Turnover","COGS / A/P","365 / A/P Turnover","Days Inventory + Days A/R − Days A/P","Revenue / PP&E net"], pts:2},
  {id:100, section:"Ratios Deep Dive", type:"matching", q:"Match each additional ratio to its formula:", pairs:[{label:"Long-term Debt to Equity",answer:"Long-term Debt / Equity"},{label:"Free Cash Flow",answer:"CFO − CapEx"},{label:"P/E Ratio",answer:"Price per Share / EPS"},{label:"Basic EPS",answer:"(Net Income − Preferred Dividends) / Wtd Avg Shares Outstanding"},{label:"Working Capital",answer:"Current Assets − Current Liabilities"},{label:"CapEx to CFO Ratio",answer:"CapEx / CFO"}], options:["Long-term Debt / Equity","CFO − CapEx","Price per Share / EPS","(Net Income − Preferred Dividends) / Wtd Avg Shares Outstanding","Current Assets − Current Liabilities","CapEx / CFO"], pts:2},

  // RATIOS DEEP DIVE — PART B: WHAT DOES THE RATIO TELL YOU?
  {id:101, section:"Ratios Deep Dive", type:"matching", q:"Match each ratio to what it measures:", pairs:[{label:"Current Ratio",answer:"Can the firm cover near-term obligations with liquid assets?"},{label:"Quick Ratio",answer:"Can the firm cover near-term obligations with cash and near-cash assets only?"},{label:"ROA",answer:"How efficiently does management use assets to generate profit?"},{label:"Asset Turnover",answer:"How much revenue does the firm generate per dollar of assets?"},{label:"Net Profit Margin",answer:"How much of each revenue dollar becomes profit?"},{label:"Interest Coverage (TIE)",answer:"How many times can operating profit cover interest obligations?"},{label:"A/R Turnover",answer:"How quickly does the firm collect from customers?"},{label:"Inventory Turnover",answer:"How quickly is inventory sold?"}], options:["Can the firm cover near-term obligations with liquid assets?","Can the firm cover near-term obligations with cash and near-cash assets only?","How efficiently does management use assets to generate profit?","How much revenue does the firm generate per dollar of assets?","How much of each revenue dollar becomes profit?","How many times can operating profit cover interest obligations?","How quickly does the firm collect from customers?","How quickly is inventory sold?"], pts:2},
  {id:102, section:"Ratios Deep Dive", type:"mc", q:"ROA is useful for comparing companies with different capital structures because:", opts:["It includes interest expense in the numerator","It ignores how the company is financed (debt vs. equity) — it measures asset efficiency regardless of financing","It only uses cash-basis numbers","It adjusts for stock splits"], ans:[1], explain:"ROA is a test of operational excellence independent of capital structure.", pts:1},
  {id:103, section:"Ratios Deep Dive", type:"multi", q:"The quick ratio excludes which items from the current ratio numerator? (Select all that apply)", opts:["Cash","Inventory","Accounts Receivable","Prepaid Expenses","Marketable Securities"], ans:[1,3], explain:"Inventory may not be easily converted to cash, and prepaid rent can't pay liabilities.", pts:1},

  // RATIOS DEEP DIVE — PART C: DUPONT DECOMPOSITION
  {id:104, section:"Ratios Deep Dive", type:"mc", q:"The DuPont decomposition of ROA is:", opts:["ROA = Net Income / Equity","ROA = Profit Margin × Asset Turnover = (Net Income / Sales) × (Sales / Total Assets)","ROA = Revenue / Total Assets","ROA = EBIT / Interest Expense"], ans:[1], explain:"The 'Sales' terms cancel, leaving Net Income / Total Assets.", pts:1},
  {id:105, section:"Ratios Deep Dive", type:"mc", q:"The full DuPont decomposition of ROE is:", opts:["ROE = Profit Margin × Asset Turnover × Financial Leverage","ROE = Net Income / Revenue","ROE = ROA × Debt/Equity","ROE = Gross Margin × Inventory Turnover"], ans:[0], explain:"= (NI/Sales) × (Sales/Assets) × (Assets/Equity)", pts:1},
  {id:106, section:"Ratios Deep Dive", type:"mc", q:"Two companies both have ROA of 6%. Company A has a profit margin of 2% and asset turnover of 3.0. Company B has a profit margin of 12% and asset turnover of 0.5. Which best describes their strategies?", opts:["Both are luxury brands","Company A is high-volume/low-margin (e.g., grocery); Company B is low-volume/high-margin (e.g., luxury)","Company A is high-margin; Company B is high-volume","There is no strategic difference"], ans:[1], explain:"This is the classic Publix (grocery) vs. luxury brand tradeoff from the slides.", pts:1},
  {id:107, section:"Ratios Deep Dive", type:"mc", q:"If ROA exceeds a company's cost of debt, increasing financial leverage will:", opts:["Decrease ROE","Increase ROE","Have no effect on ROE","Decrease ROA"], ans:[1], explain:"Leverage amplifies ROA into ROE. If the return on assets exceeds the borrowing cost, more leverage benefits shareholders.", pts:1},

  // RATIOS DEEP DIVE — PART D: LIQUIDITY
  {id:108, section:"Ratios Deep Dive", type:"fill_multi", q:"Given: Current Assets $500K (Cash $100K, A/R $150K, Inventory $200K, Prepaid $50K), Marketable Securities $0, Current Liabilities $250K.\n\nCalculate:", fields:[{label:"Current Ratio",ans:"2.0"},{label:"Quick Ratio",ans:"1.0"}], explain:"Current Ratio = $500K / $250K = 2.0. Quick Ratio = ($100K + $150K + $0) / $250K = 1.0", pts:2},
  {id:109, section:"Ratios Deep Dive", type:"mc", q:"A company's current ratio is increasing over time, but its quick ratio is staying flat. This most likely means:", opts:["The company is building up cash reserves","The company is accumulating inventory (or prepaid expenses) that may not be easily converted to cash","The company is paying off long-term debt","The company is issuing more stock"], ans:[1], explain:"The divergence between current and quick ratio points to inventory or prepaids growing — current assets that the quick ratio excludes.", pts:1},
  {id:110, section:"Ratios Deep Dive", type:"mc", q:"A current ratio below 1.0 means:", opts:["The company is highly profitable","Current liabilities exceed current assets — the company may struggle to meet near-term obligations","The company has no debt","The company has negative equity"], ans:[1], explain:"Target had a current ratio of 0.9 in the industry comparison — not uncommon for retailers, but worth watching.", pts:1},
  {id:111, section:"Ratios Deep Dive", type:"tf", q:"True or False: A very high current ratio is always good.", ans:false, explain:"A very high current ratio could indicate poor asset utilization — too much cash or inventory sitting idle rather than being deployed productively.", pts:1},
  {id:112, section:"Ratios Deep Dive", type:"mc", q:"A company collects $200K cash from a customer who previously owed on account. What happens to the current ratio?", opts:["Increases","Decreases","No change — both cash and A/R are current assets, total CA unchanged","Depends on the amount of current liabilities"], ans:[2], explain:"Cash goes up, A/R goes down by the same amount. Total current assets unchanged.", pts:1},

  // RATIOS DEEP DIVE — PART E: LEVERAGE & SOLVENCY
  {id:113, section:"Ratios Deep Dive", type:"mc", q:"A company has Total Liabilities of $40M and Total Equity of $60M. The leverage ratio (D/E) is:", opts:["0.67","1.5","0.4","2.5"], ans:[0], explain:"$40M / $60M = 0.67", pts:1},
  {id:114, section:"Ratios Deep Dive", type:"matching", q:"A company issues $10M in new long-term debt. What happens to each ratio?", pairs:[{label:"Leverage (D/E)",answer:"Increases"},{label:"Current Ratio",answer:"No change (LT debt isn't current)"},{label:"Interest Coverage (TIE)",answer:"Decreases over time (more interest expense)"}], options:["Increases","No change (LT debt isn't current)","Decreases over time (more interest expense)"], explain:"Liabilities up → leverage up. LT debt doesn't affect current items. More interest expense erodes TIE.", pts:1},
  {id:115, section:"Ratios Deep Dive", type:"matching", q:"A company uses cash to pay off $5M of short-term debt. What happens? (Assume ratios were > 1.0 before)", pairs:[{label:"Current Ratio",answer:"Increases"},{label:"Leverage (D/E)",answer:"Decreases"},{label:"Quick Ratio",answer:"Increases"}], options:["Increases","Decreases"], explain:"If current ratio was above 1, removing equal amounts from both numerator (cash) and denominator (CL) pushes the ratio up. Example: 300/200 = 1.5 → 295/195 = 1.51.", pts:1},
  {id:116, section:"Ratios Deep Dive", type:"mc", q:"A company has EBIT of $120K and interest expense of $30K. The TIE is:", opts:["0.25x","4.0x","$90K","30x"], ans:[1], explain:"$120K / $30K = 4.0x. The company can cover its interest 4 times over. Generally, below 1.5–2x is concerning.", pts:1},

  // RATIOS DEEP DIVE — PART F: EFFICIENCY / TURNOVER
  {id:117, section:"Ratios Deep Dive", type:"fill_multi", q:"NVDA has Revenue of $130,497 and A/R of $23,065. Calculate:", fields:[{label:"A/R Turnover (round to 2 decimals)",ans:"5.66"},{label:"Days A/R (round to 1 decimal)",ans:"64.5"}], explain:"A/R Turnover = 130,497 / 23,065 = 5.66. Days A/R = 365 / 5.66 = 64.5 days.", pts:2},
  {id:118, section:"Ratios Deep Dive", type:"mc", q:"Last year, NVDA's A/R Turnover was 6.09 (Days A/R = 59.9 days). This year it's 5.66 (Days A/R = 64.5 days). This means:", opts:["NVDA is collecting from customers faster","NVDA is collecting from customers slower — it's taking about 4.5 more days on average","NVDA's revenue decreased","NVDA wrote off more bad debts"], ans:[1], explain:"Lower turnover = slower collection = higher Days A/R. Could indicate more lenient credit terms or collection issues.", pts:1},
  {id:119, section:"Ratios Deep Dive", type:"fill_multi", q:"A company has COGS of $80M and Inventory of $20M. Calculate:", fields:[{label:"Inventory Turnover",ans:"4.0"},{label:"Days Inventory (round to 2 decimals)",ans:"91.25"}], explain:"Inventory Turnover = $80M / $20M = 4.0. Days Inventory = 365 / 4.0 = 91.25 days.", pts:2},
  {id:120, section:"Ratios Deep Dive", type:"mc", q:"A higher inventory turnover generally indicates:", opts:["The company is holding too much inventory","Inventory is being sold more quickly — more efficient inventory management","COGS is decreasing","The company is overstating revenue"], ans:[1], explain:"But context matters — too high could mean stockouts.", pts:1},
  {id:121, section:"Ratios Deep Dive", type:"fill_multi", q:"A/P Turnover = COGS / Accounts Payable. A company has COGS of $80M and A/P of $16M. Calculate:", fields:[{label:"A/P Turnover",ans:"5.0"},{label:"Days A/P",ans:"73"}], explain:"A/P Turnover = $80M / $16M = 5.0. Days A/P = 365 / 5.0 = 73 days.", pts:2},
  {id:122, section:"Ratios Deep Dive", type:"mc", q:"A company is taking longer to pay its suppliers (Days A/P is increasing). This:", opts:["Always indicates financial distress","Could be a strategic decision to hold onto cash longer, or could signal liquidity problems — context matters","Means inventory turnover is also increasing","Has no effect on the cash-to-cash cycle"], ans:[1], explain:"Longer Days A/P shortens the cash-to-cash cycle (good for cash management), but if involuntary, it's a red flag.", pts:1},

  // RATIOS DEEP DIVE — PART G: CASH-TO-CASH CYCLE
  {id:123, section:"Ratios Deep Dive", type:"mc", q:"The cash-to-cash (C2C) conversion cycle equals:", opts:["Days A/R + Days A/P − Days Inventory","Days Inventory + Days A/R − Days A/P","Days Inventory − Days A/R + Days A/P","Revenue / Total Assets"], ans:[1], pts:1},
  {id:124, section:"Ratios Deep Dive", type:"mc", q:"Company X: Days Inventory = 60, Days A/R = 35, Days A/P = 45. The C2C cycle is:", opts:["140 days","50 days","70 days","30 days"], ans:[1], explain:"60 + 35 − 45 = 50 days", pts:1},
  {id:125, section:"Ratios Deep Dive", type:"mc", q:"A C2C cycle of 0 means:", opts:["The company has no inventory","The company collects cash from customers at exactly the same time it pays suppliers","The company is unprofitable","The company has no accounts payable"], ans:[1], explain:"A negative C2C means the company gets paid by customers BEFORE it has to pay suppliers — very favorable (common for companies like Amazon or Costco with membership models).", pts:1},
  {id:126, section:"Ratios Deep Dive", type:"multi", q:"Which of the following actions would shorten the cash-to-cash cycle? (Select all that apply)", opts:["Collect from customers faster (reduce Days A/R)","Sell inventory faster (reduce Days Inventory)","Pay suppliers slower (increase Days A/P)","Increase inventory on hand","Offer customers longer payment terms"], ans:[0,1,2], explain:"Options (d) and (e) would lengthen the cycle.", pts:1},

  // RATIOS DEEP DIVE — PART H: PROFITABILITY — MARGINS
  {id:127, section:"Ratios Deep Dive", type:"fill_multi", q:"A company has Revenue $200M, COGS $120M, Operating Expenses $40M, Net Income $24M. Calculate (enter as %):", fields:[{label:"Gross Margin",ans:"40%"},{label:"Operating Margin",ans:"20%"},{label:"Net Profit Margin",ans:"12%"}], explain:"Gross Margin = ($200M − $120M) / $200M = 40%. Operating Margin = ($80M − $40M) / $200M = 20%. Net Profit Margin = $24M / $200M = 12%.", pts:3},
  {id:128, section:"Ratios Deep Dive", type:"mc", q:"Gross margin measures profitability from:", opts:["All operations including interest and taxes","Core production/service delivery only (revenue minus COGS)","Cash flow from operations","Return to shareholders"], ans:[1], explain:"It tells you how efficiently the company produces its goods before operating expenses.", pts:1},
  {id:129, section:"Ratios Deep Dive", type:"mc", q:"A company's gross margin is stable at 40%, but its net profit margin is declining. This most likely means:", opts:["COGS is increasing","Operating expenses (SG&A, R&D, interest, or taxes) are growing faster than revenue","Revenue is declining","The company did a stock split"], ans:[1], explain:"The margin erosion is happening below the gross profit line.", pts:1},

  // RATIOS DEEP DIVE — PART I: ROA DECOMPOSITION & CROSS-RATIO ANALYSIS
  {id:130, section:"Ratios Deep Dive", type:"fill_multi", q:"Company A: Profit Margin 15%, Asset Turnover 0.8.\nCompany B: Profit Margin 3%, Asset Turnover 4.0.\n\nCalculate ROA for each (enter as %):", fields:[{label:"Company A ROA",ans:"12%"},{label:"Company B ROA",ans:"12%"}], explain:"Company A: 15% × 0.8 = 12%. Company B: 3% × 4.0 = 12%. Same ROA, completely different strategies.", pts:2},
  {id:131, section:"Ratios Deep Dive", type:"multi", q:"A goodwill impairment of $50M would affect which ratios? (Select all that apply)", opts:["ROA — decreases (net income lower)","Net Profit Margin — decreases (impairment loss reduces net income)","Asset Turnover — increases (total assets decrease, revenue unchanged)","Current Ratio — no effect (goodwill is non-current)","Quick Ratio — no effect"], ans:[0,1,2,3,4], explain:"Impairment lowers ROA and net margin, increases asset turnover, no effect on liquidity ratios. When impairment is large, calculate ratios both with and without it.", pts:1},

  // RATIOS DEEP DIVE — PART J: TRANSACTION EFFECTS ON RATIOS
  {id:132, section:"Ratios Deep Dive", type:"matching", q:"A company issues 1M new shares of common stock at $20/share. What happens to each ratio?", pairs:[{label:"Leverage (D/E)",answer:"Decreases (equity up, liabilities same)"},{label:"Current Ratio",answer:"Increases (cash up, CL same)"},{label:"ROE",answer:"Decreases (equity denominator grows)"},{label:"EPS",answer:"Decreases (more shares outstanding, same NI)"}], options:["Decreases (equity up, liabilities same)","Increases (cash up, CL same)","Decreases (equity denominator grows)","Decreases (more shares outstanding, same NI)"], pts:1},
  {id:133, section:"Ratios Deep Dive", type:"mc", q:"A company uses $50K cash to purchase inventory. What happens to the current ratio?", opts:["Increases","Decreases","No change — swapping one current asset (cash) for another (inventory)","Depends on the quick ratio"], ans:[2], pts:1},
  {id:134, section:"Ratios Deep Dive", type:"mc", q:"A company uses $50K cash to purchase inventory. What happens to the quick ratio?", opts:["Increases","Decreases — cash goes down but inventory is excluded from the quick ratio","No change","Depends on the current ratio"], ans:[1], explain:"Cash is in the quick ratio numerator, inventory is not. So the numerator shrinks.", pts:1},
  {id:135, section:"Ratios Deep Dive", type:"mc", q:"A company writes off $500 of receivables (A/R gross decreases, Allowance for Doubtful Accounts decreases by the same amount, so A/R net is unchanged). What happens to the current ratio?", opts:["Increases","Decreases","No change — A/R net is unchanged","Depends on inventory"], ans:[2], explain:"The write-off reduces both gross A/R and the allowance by the same amount, so net A/R (which is what appears on the balance sheet) doesn't change.", pts:1},
  {id:136, section:"Ratios Deep Dive", type:"matching", q:"A company records $25K of depreciation expense. What happens to each ratio?", pairs:[{label:"ROA",answer:"Decreases (NI down, Assets down)"},{label:"Net Profit Margin",answer:"Decreases (NI down, revenue unchanged)"},{label:"Asset Turnover",answer:"Increases (total assets decrease, revenue unchanged)"},{label:"Current Ratio",answer:"No change (depreciation doesn't affect current assets or CL)"}], options:["Decreases (NI down, Assets down)","Decreases (NI down, revenue unchanged)","Increases (total assets decrease, revenue unchanged)","No change (depreciation doesn't affect current assets or CL)"], pts:1},
  {id:137, section:"Ratios Deep Dive", type:"matching", q:"A company makes a $10K sale on account (credit sale). COGS is $6K. What happens to each ratio?", pairs:[{label:"Current Ratio",answer:"Increases (A/R up more than inventory down)"},{label:"A/R Turnover",answer:"Depends (revenue up, A/R up — net depends on relative size)"},{label:"Net Profit Margin",answer:"Depends on overall income mix"},{label:"Quick Ratio",answer:"Increases (A/R is included in quick ratio numerator)"}], options:["Increases (A/R up more than inventory down)","Depends (revenue up, A/R up — net depends on relative size)","Depends on overall income mix","Increases (A/R is included in quick ratio numerator)"], pts:1},

  // RATIOS DEEP DIVE — PART K: INDUSTRY COMPARISON
  {id:138, section:"Ratios Deep Dive", type:"mc", q:"Use the following data:\n\n| | ACN | GOOGL | XOM | TGT |\n| Quick Ratio | 1.2 | 1.9 | 1.1 | 0.3 |\n\nWhich company has the most liquidity risk based on quick ratio?", opts:["ACN","GOOGL","XOM","TGT"], ans:[3], explain:"TGT with 0.3. Its quick ratio is far below 1.0, meaning near-cash assets can't cover current liabilities.", pts:1},
  {id:139, section:"Ratios Deep Dive", type:"mc", q:"Target's current ratio (0.9) and quick ratio (0.3) have a large gap. This most likely means:", opts:["Target holds large amounts of inventory relative to cash and A/R","Target has no debt","Target is very profitable","Target's A/R is growing rapidly"], ans:[0], explain:"Retail companies like Target carry large amounts of inventory, which is in the current ratio but excluded from the quick ratio.", pts:1},
  {id:140, section:"Ratios Deep Dive", type:"mc", q:"Use the following data:\n\n| | ACN | GOOGL | XOM | TGT |\n| Debt/Equity | 0.0 | 0.1 | 0.2 | 1.1 |\n\nWhich company has the highest financial leverage?", opts:["ACN (D/E = 0.0)","GOOGL (D/E = 0.1)","XOM (D/E = 0.2)","TGT (D/E = 1.1)"], ans:[3], explain:"TGT. A D/E of 1.1 means liabilities exceed equity.", pts:1},

  // RATIOS DEEP DIVE — PART L: FIXED ASSET & CAPEX RATIOS
  {id:141, section:"Ratios Deep Dive", type:"mc", q:"Fixed Asset Turnover is:", opts:["Revenue / Total Assets","Revenue / PP&E, net","COGS / PP&E, net","PP&E, net / Revenue"], ans:[1], explain:"Measures how much revenue the firm generates per dollar of PP&E.", pts:1},
  {id:142, section:"Ratios Deep Dive", type:"mc", q:"The CapEx to CFO ratio measures:", opts:["How much of the company's operating cash flow is consumed by capital expenditures","The company's profit margin","How quickly inventory turns over","The company's leverage"], ans:[0], explain:"A high ratio means the company is spending heavily on maintaining/growing its asset base relative to the cash it generates from operations.", pts:1},
  {id:143, section:"Ratios Deep Dive", type:"mc", q:"Free Cash Flow = CFO − CapEx. A company has CFO of $500M and CapEx of $300M. FCF is:", opts:["$800M","$200M","-$200M","$300M"], ans:[1], explain:"$500M − $300M = $200M. This is the cash available after maintaining/expanding the asset base — available for dividends, buybacks, or debt repayment.", pts:1},

  // RATIOS DEEP DIVE — PART M: INTERPRETATION SCENARIOS
  {id:144, section:"Ratios Deep Dive", type:"mc", q:"A company's ROE has increased from 12% to 18% over two years, but ROA has stayed flat at 8%. What is the most likely driver?", opts:["Improved profit margins","Better asset utilization","Increased financial leverage (more debt relative to equity)","Higher revenue growth"], ans:[2], explain:"ROE = ROA × Financial Leverage. If ROA is flat but ROE is rising, leverage must be increasing.", pts:1},
  {id:145, section:"Ratios Deep Dive", type:"mc", q:"A company's net profit margin is increasing but its cash flow from operations is declining. This is a signal of:", opts:["Strong operational performance","Potential earnings quality concerns — profits may be driven by accruals rather than cash","The company is paying off debt","Revenue is declining"], ans:[1], explain:"Divergence between profitability ratios and cash-based metrics is a classic earnings quality red flag.", pts:1},
  {id:146, section:"Ratios Deep Dive", type:"mc", q:"A retailer's Days Inventory has increased from 45 to 75 days over two years while revenue growth has slowed. This most likely indicates:", opts:["The company is efficiently stocking up for future growth","Inventory is accumulating — possibly due to slowing demand or overordering, which may lead to markdowns","The company improved its supply chain","COGS decreased significantly"], ans:[1], explain:"Rising Days Inventory + slowing revenue = potential obsolescence or demand problem.", pts:1},
  {id:147, section:"Ratios Deep Dive", type:"mc", q:"Company X has a negative cash-to-cash cycle. This means:", opts:["The company is losing money","The company collects cash from customers before it has to pay its suppliers — favorable working capital position","The company has no inventory","The company's Days A/R exceeds Days Inventory"], ans:[1], explain:"Companies like Amazon, Costco, and some subscription businesses achieve this — they essentially use supplier/customer float to fund operations.", pts:1},
];

const SECTIONS = [...new Set(QUESTIONS.map(q => q.section))];

function QuestionCard({ question, userAnswer, onAnswer, showResult, questionNum, totalQuestions }) {
  const { type, q, opts, pairs, options, fields, explain } = question;
  const isCorrect = showResult ? checkAnswer(question, userAnswer) : null;

  function renderQuestion() {
    switch(type) {
      case "mc": return <MCQuestion opts={opts} userAnswer={userAnswer} onAnswer={onAnswer} showResult={showResult} correctAns={question.ans} />;
      case "multi": return <MultiQuestion opts={opts} userAnswer={userAnswer || []} onAnswer={onAnswer} showResult={showResult} correctAns={question.ans} />;
      case "tf": return <TFQuestion userAnswer={userAnswer} onAnswer={onAnswer} showResult={showResult} correctAns={question.ans} />;
      case "matching": return <MatchingQuestion pairs={pairs} options={options} userAnswer={userAnswer || {}} onAnswer={onAnswer} showResult={showResult} />;
      case "fill": return <FillQuestion userAnswer={userAnswer} onAnswer={onAnswer} showResult={showResult} correctAns={question.ans} />;
      case "fill_multi": return <FillMultiQuestion fields={fields} userAnswer={userAnswer || {}} onAnswer={onAnswer} showResult={showResult} />;
      default: return null;
    }
  }

  const borderColor = showResult ? (isCorrect ? "#0B874B" : "#D93025") : "#C7CDD1";
  const headerBg = showResult ? (isCorrect ? "#0B874B" : "#D93025") : "#F5F5F5";
  const headerColor = showResult ? "#fff" : "#2D3B45";

  return (
    <div style={{marginBottom:24}}>
      <div style={{height:28, marginBottom:6, display:"flex", alignItems:"center"}}>
        {showResult && (
          <div style={{background:isCorrect?"#0B874B":"#D93025", color:"#fff", fontSize:13, fontWeight:600, padding:"4px 12px", borderRadius:4}}>{isCorrect?"Correct answer":"Incorrect"}</div>
        )}
      </div>
      <div style={{border:`1px solid ${borderColor}`, borderRadius:4, borderLeft:`3px solid ${borderColor}`, background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{background:headerBg, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${borderColor}`}}>
          <span style={{fontWeight:700, fontSize:16, color:headerColor}}>Question {questionNum}</span>
          <span style={{fontSize:14, color:headerColor, opacity:0.8}}>{question.pts} / {question.pts} pts</span>
        </div>
      <div style={{padding:"20px 24px"}}>
        <div style={{fontSize:15, lineHeight:1.6, color:"#2D3B45", whiteSpace:"pre-line", marginBottom:20}}>{q}</div>
        <div style={{borderTop:"1px solid #E8E8E8", paddingTop:16}}>{renderQuestion()}</div>
        {showResult && explain && (
          <div style={{marginTop:16, padding:"12px 16px", background:"#F0F7FF", borderLeft:"3px solid #0374B5", borderRadius:4, fontSize:14, color:"#2D3B45", lineHeight:1.5}}>
            <strong>Explanation:</strong> {explain}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function MCQuestion({ opts, userAnswer, onAnswer, showResult, correctAns }) {
  return opts.map((opt, i) => {
    const selected = userAnswer === i;
    const isCorrectOpt = correctAns.includes(i);
    let bg = "transparent";
    let borderCol = "#C7CDD1";
    if (showResult && isCorrectOpt) { bg = "#E6F4EA"; borderCol = "#0B874B"; }
    else if (showResult && selected && !isCorrectOpt) { bg = "#FCE8E6"; borderCol = "#D93025"; }
    return (
      <div key={i} onClick={() => !showResult && onAnswer(i)} style={{padding:"12px 16px", borderTop:i>0?"1px solid #E8E8E8":"none", cursor:showResult?"default":"pointer", background:bg, display:"flex", alignItems:"center", gap:12, transition:"background 0.15s"}}>
        <div style={{width:20, height:20, borderRadius:"50%", border:`2px solid ${selected||( showResult&&isCorrectOpt)?"#0374B5":borderCol}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
          {(selected||(showResult&&isCorrectOpt)) && <div style={{width:10, height:10, borderRadius:"50%", background:showResult?(isCorrectOpt?"#0B874B":"#D93025"):"#0374B5"}} />}
        </div>
        <span style={{fontSize:15, color:showResult&&!isCorrectOpt&&!selected?"#8B959E":"#2D3B45"}}>{opt}</span>
        {showResult && isCorrectOpt && <span style={{marginLeft:"auto", color:"#0B874B", fontSize:20}}>✓</span>}
        {showResult && selected && !isCorrectOpt && <span style={{marginLeft:"auto", color:"#D93025", fontSize:16}}>✗</span>}
      </div>
    );
  });
}

function MultiQuestion({ opts, userAnswer, onAnswer, showResult, correctAns }) {
  const toggle = (i) => {
    if (showResult) return;
    const next = userAnswer.includes(i) ? userAnswer.filter(x=>x!==i) : [...userAnswer, i];
    onAnswer(next);
  };
  return opts.map((opt, i) => {
    const selected = userAnswer.includes(i);
    const isCorrectOpt = correctAns.includes(i);
    let bg = "transparent";
    if (showResult && isCorrectOpt) bg = "#E6F4EA";
    else if (showResult && selected && !isCorrectOpt) bg = "#FCE8E6";
    return (
      <div key={i} onClick={()=>toggle(i)} style={{padding:"12px 16px", borderTop:i>0?"1px solid #E8E8E8":"none", cursor:showResult?"default":"pointer", background:bg, display:"flex", alignItems:"center", gap:12}}>
        <div style={{width:18, height:18, borderRadius:3, border:`2px solid ${selected||(showResult&&isCorrectOpt)?"#0374B5":"#C7CDD1"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:selected?"#0374B5":"transparent"}}>
          {selected && <span style={{color:"#fff", fontSize:12, fontWeight:700}}>✓</span>}
        </div>
        <span style={{fontSize:15, color:showResult&&!isCorrectOpt&&!selected?"#8B959E":"#2D3B45"}}>{opt}</span>
        {showResult && isCorrectOpt && <span style={{marginLeft:"auto", color:"#0B874B", fontSize:20}}>✓</span>}
      </div>
    );
  });
}

function TFQuestion({ userAnswer, onAnswer, showResult, correctAns }) {
  return ["True","False"].map((opt, i) => {
    const val = i === 0;
    const selected = userAnswer === val;
    const isCorrectOpt = correctAns === val;
    let bg = "transparent";
    if (showResult && isCorrectOpt) bg = "#E6F4EA";
    else if (showResult && selected && !isCorrectOpt) bg = "#FCE8E6";
    return (
      <div key={i} onClick={()=>!showResult&&onAnswer(val)} style={{padding:"12px 16px", borderTop:i>0?"1px solid #E8E8E8":"none", cursor:showResult?"default":"pointer", background:bg, display:"flex", alignItems:"center", gap:12}}>
        <div style={{width:20, height:20, borderRadius:"50%", border:`2px solid ${selected||(showResult&&isCorrectOpt)?"#0374B5":"#C7CDD1"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
          {(selected||(showResult&&isCorrectOpt)) && <div style={{width:10, height:10, borderRadius:"50%", background:showResult?(isCorrectOpt?"#0B874B":"#D93025"):"#0374B5"}} />}
        </div>
        <span style={{fontSize:15, color:"#2D3B45"}}>{opt}</span>
        {showResult && isCorrectOpt && <span style={{marginLeft:"auto", color:"#0B874B", fontSize:20}}>✓</span>}
      </div>
    );
  });
}

function MatchingQuestion({ pairs, options, userAnswer, onAnswer, showResult }) {
  return pairs.map((pair, i) => {
    const selected = userAnswer[pair.label] || "";
    const isCorrect = selected === pair.answer;
    return (
      <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderTop:i>0?"1px solid #E8E8E8":"none", gap:16}}>
        {showResult && <span style={{color:isCorrect?"#0B874B":"#D93025", fontSize:18, flexShrink:0}}>{isCorrect?"✓":"✗"}</span>}
        <span style={{fontWeight:600, fontSize:15, color:"#2D3B45", flex:1}}>{pair.label}</span>
        <select value={selected} onChange={e=>{if(!showResult){const next={...userAnswer};next[pair.label]=e.target.value;onAnswer(next);}}} disabled={showResult} style={{padding:"8px 32px 8px 12px", fontSize:14, border:"1px solid #C7CDD1", borderRadius:4, background:showResult?(isCorrect?"#E6F4EA":"#FCE8E6"):"#F5F5F5", color:"#2D3B45", minWidth:200, appearance:"auto", cursor:showResult?"default":"pointer"}}>
          <option value="">[ Select ]</option>
          {options.map((o,j)=><option key={j} value={o}>{o}</option>)}
        </select>
      </div>
    );
  });
}

function FillQuestion({ userAnswer, onAnswer, showResult, correctAns }) {
  const isCorrect = showResult && String(userAnswer).trim().toLowerCase() === String(correctAns).trim().toLowerCase();
  return (
    <div style={{display:"flex", alignItems:"center", gap:12}}>
      {showResult && <span style={{color:isCorrect?"#0B874B":"#D93025", fontSize:18}}>{ isCorrect?"✓":"✗"}</span>}
      <input type="text" value={userAnswer||""} onChange={e=>!showResult&&onAnswer(e.target.value)} disabled={showResult} placeholder="Type your answer" style={{padding:"8px 12px", fontSize:15, border:`1px solid ${showResult?(isCorrect?"#0B874B":"#D93025"):"#C7CDD1"}`, borderRadius:4, width:200, background:showResult?(isCorrect?"#E6F4EA":"#FCE8E6"):"#fff", color:"#2D3B45"}} />
      {showResult && !isCorrect && <span style={{fontSize:14, color:"#0B874B"}}>→ {correctAns}</span>}
    </div>
  );
}

function FillMultiQuestion({ fields, userAnswer, onAnswer, showResult }) {
  return fields.map((field, i) => {
    const val = userAnswer[field.label] || "";
    const isCorrect = showResult && String(val).trim().replace(/[,$\s%]/g,"").toLowerCase() === String(field.ans).trim().replace(/[,$\s%]/g,"").toLowerCase();
    return (
      <div key={i} style={{display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderTop:i>0?"1px solid #F0F0F0":"none"}}>
        {showResult && <span style={{color:isCorrect?"#0B874B":"#D93025", fontSize:18, flexShrink:0}}>{isCorrect?"✓":"✗"}</span>}
        <span style={{fontSize:14, color:"#2D3B45", minWidth:200, fontWeight:500}}>{field.label}:</span>
        <input type="text" value={val} onChange={e=>{if(!showResult){const next={...userAnswer};next[field.label]=e.target.value;onAnswer(next);}}} disabled={showResult} style={{padding:"6px 10px", fontSize:14, border:`1px solid ${showResult?(isCorrect?"#0B874B":"#D93025"):"#C7CDD1"}`, borderRadius:4, width:140, background:showResult?(isCorrect?"#E6F4EA":"#FCE8E6"):"#fff", color:"#2D3B45"}} />
        {showResult && !isCorrect && <span style={{fontSize:13, color:"#0B874B"}}>→ {field.ans}</span>}
      </div>
    );
  });
}

function checkAnswer(question, userAnswer) {
  const { type, ans, pairs, fields } = question;
  if (userAnswer === undefined || userAnswer === null) return false;
  switch(type) {
    case "mc": return ans.includes(userAnswer);
    case "multi": return Array.isArray(userAnswer) && ans.length===userAnswer.length && ans.every(a=>userAnswer.includes(a));
    case "tf": return userAnswer === ans;
    case "matching": return pairs.every(p => (userAnswer[p.label]||"") === p.answer);
    case "fill": return String(userAnswer).trim().replace(/[,$\s%]/g,"").toLowerCase() === String(ans).trim().replace(/[,$\s%]/g,"").toLowerCase();
    case "fill_multi": return fields.every(f => String(userAnswer[f.label]||"").trim().replace(/[,$\s%]/g,"").toLowerCase() === String(f.ans).trim().replace(/[,$\s%]/g,"").toLowerCase());
    default: return false;
  }
}

function buildSystemMessage(question, userAnswer, isSubmitted) {
  let context = `You are an accounting instructor for students without an accounting background. Stay focused on accounting and related business topics. Be concise and instructive. Don't over-explain or provide too much detail.\n\nThe student is currently looking at this question:\n\nQ: ${question.q}`;
  if (question.opts) context += `\nOptions:\n${question.opts.map((o, i) => `  ${i}) ${o}`).join("\n")}`;
  if (question.pairs) context += `\nMatching items:\n${question.pairs.map(p => `  ${p.label} → ?`).join("\n")}`;
  if (question.fields) context += `\nFields to fill:\n${question.fields.map(f => `  ${f.label}: ?`).join("\n")}`;
  if (isSubmitted) {
    const correct = checkAnswer(question, userAnswer);
    context += `\n\nThe student has submitted their answer and got it ${correct ? "CORRECT" : "INCORRECT"}.`;
    if (question.type === "mc" && userAnswer !== undefined) context += ` They chose: "${question.opts[userAnswer]}"`;
    if (question.type === "tf" && userAnswer !== undefined) context += ` They chose: ${userAnswer}`;
    if (question.explain) context += `\nExplanation shown to student: ${question.explain}`;
    if (!correct) {
      const ans = question.ans;
      if (question.type === "mc") context += `\nCorrect answer: "${question.opts[ans[0]]}"`;
      else if (question.type === "tf") context += `\nCorrect answer: ${ans}`;
    }
  } else {
    context += `\n\nThe student has NOT submitted yet. Do NOT reveal the answer. Help them reason through it.`;
  }
  return { role: "system", content: context };
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(<pre key={elements.length} style={{background:"#1a1a1a", color:"#e0e0e0", padding:"8px 10px", borderRadius:4, fontSize:13, overflowX:"auto", margin:"4px 0"}}><code>{codeLines.join("\n")}</code></pre>);
      continue;
    }
    const renderInline = (s) => {
      const parts = [];
      const re = /(\*\*(.+?)\*\*)|(`(.+?)`)/g;
      let last = 0;
      let match;
      while ((match = re.exec(s)) !== null) {
        if (match.index > last) parts.push(s.slice(last, match.index));
        if (match[2]) parts.push(<strong key={parts.length}>{match[2]}</strong>);
        else if (match[4]) parts.push(<code key={parts.length} style={{background:"#E8E8E8", padding:"1px 4px", borderRadius:3, fontSize:"0.9em"}}>{match[4]}</code>);
        last = re.lastIndex;
      }
      if (last < s.length) parts.push(s.slice(last));
      return parts;
    };
    if (line.trim() === "") { elements.push(<div key={elements.length} style={{height:8}} />); i++; continue; }
    if (/^#{1,3}\s/.test(line)) {
      const text = line.replace(/^#{1,3}\s+/, "");
      elements.push(<div key={elements.length} style={{fontWeight:700, fontSize:15, margin:"4px 0"}}>{renderInline(text)}</div>);
      i++; continue;
    }
    if (/^[-•*]\s/.test(line.trim())) {
      elements.push(<div key={elements.length} style={{paddingLeft:12, margin:"2px 0"}}>{"• "}{renderInline(line.trim().replace(/^[-•*]\s+/, ""))}</div>);
      i++; continue;
    }
    if (/^\d+\.\s/.test(line.trim())) {
      const num = line.trim().match(/^(\d+)\./)[1];
      elements.push(<div key={elements.length} style={{paddingLeft:12, margin:"2px 0"}}>{num}. {renderInline(line.trim().replace(/^\d+\.\s+/, ""))}</div>);
      i++; continue;
    }
    elements.push(<div key={elements.length} style={{margin:"2px 0"}}>{renderInline(line)}</div>);
    i++;
  }
  return elements;
}

function ChatDrawer({ question, userAnswer, isSubmitted, isOpen, onToggle, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const prevQuestionId = useRef(question?.id);

  // Insert a separator when the question changes so we know which messages belong to which question
  useEffect(() => {
    if (question && question.id !== prevQuestionId.current) {
      if (messages.length > 0) {
        setMessages(prev => [...prev, { role: "separator", questionId: question.id, content: `— Question ${question.id} —` }]);
      }
      prevQuestionId.current = question.id;
    }
  }, [question]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg = { role: "user", content: text, questionId: question.id };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const systemMsg = buildSystemMessage(question, userAnswer, isSubmitted);
      // Only send messages from the current question to the API
      const lastSepIdx = newMessages.map((m, i) => m.role === "separator" ? i : -1).filter(i => i >= 0).pop();
      const contextMessages = lastSepIdx !== undefined ? newMessages.slice(lastSepIdx + 1) : newMessages;
      const apiMessages = contextMessages.filter(m => m.role === "user" || m.role === "assistant");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [systemMsg, ...apiMessages] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "assistant", content: data.content, questionId: question.id }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Try again.", questionId: question.id }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{width: isOpen ? "36%" : 0, minWidth: isOpen ? 340 : 0, borderLeft: isOpen ? "1px solid #C7CDD1" : "none", background:"#fff", display:"flex", flexDirection:"column", transition:"width 0.3s ease, min-width 0.3s ease", overflow:"hidden", flexShrink:0, height:"100vh"}}>
      <div style={{background:"#2D3B45", padding:"12px 16px", borderBottom:"3px solid #0374B5", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0}}>
        <span style={{color:"#fff", fontWeight:600, fontSize:14}}>Ask about this question</span>
        <button onClick={onToggle} style={{background:"transparent", border:"none", color:"#8B959E", fontSize:18, cursor:"pointer", padding:"0 4px"}}>✕</button>
      </div>
      <div style={{flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10}}>
        {messages.length === 0 && (
          <div style={{color:"#8B959E", fontSize:13, textAlign:"center", marginTop:24, padding:"0 8px"}}>Ask anything about the current question. The tutor can see what you're working on.</div>
        )}
        {messages.map((m, i) => {
          if (m.role === "separator") {
            return (
              <div key={i} style={{display:"flex", alignItems:"center", gap:8, margin:"8px 0"}}>
                <div style={{flex:1, height:1, background:"#E8E8E8"}} />
                <span style={{fontSize:11, color:"#8B959E", whiteSpace:"nowrap"}}>{m.content}</span>
                <div style={{flex:1, height:1, background:"#E8E8E8"}} />
              </div>
            );
          }
          return (
            <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"90%"}}>
              <div style={{background:m.role==="user"?"#0374B5":"#F5F5F5", color:m.role==="user"?"#fff":"#2D3B45", padding:"10px 14px", borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px", fontSize:14, lineHeight:1.6}}>
                {m.role === "user" ? m.content : renderMarkdown(m.content)}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{alignSelf:"flex-start", maxWidth:"90%"}}>
            <div style={{background:"#F5F5F5", color:"#8B959E", padding:"10px 14px", borderRadius:"12px 12px 12px 2px", fontSize:14}}>Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{padding:"16px 16px 20px", borderTop:"1px solid #E8E8E8", display:"flex", gap:8, flexShrink:0}}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask a question..."
          style={{flex:1, padding:"12px 14px", border:"1px solid #C7CDD1", borderRadius:6, fontSize:15, outline:"none", background:"#fff", color:"#2D3B45"}}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{background:input.trim()?"#0374B5":"#C7CDD1", color:"#fff", border:"none", padding:"12px 20px", borderRadius:6, fontSize:15, fontWeight:600, cursor:input.trim()?"pointer":"default"}}>Send</button>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("menu");
  const [filter, setFilter] = useState("All");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [score, setScore] = useState({correct:0, total:0, pts:0, maxPts:0});
  const [shuffled, setShuffled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const filteredQs = useMemo(() => {
    let qs = filter === "All" ? [...QUESTIONS] : QUESTIONS.filter(q=>q.section===filter);
    if (shuffled) qs = qs.sort(()=>Math.random()-0.5);
    return qs;
  }, [filter, shuffled]);

  const startQuiz = (section, shuffle) => {
    setFilter(section);
    setShuffled(shuffle);
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted({});
    setScore({correct:0,total:0,pts:0,maxPts:0});
    setMode("quiz");
  };

  const current = questions.length > 0 ? questions[currentIdx] : null;

  useEffect(() => {
    if (mode === "quiz") {
      let qs = filter === "All" ? [...QUESTIONS] : QUESTIONS.filter(q=>q.section===filter);
      if (shuffled) qs = qs.sort(()=>Math.random()-0.5);
      setQuestions(qs);
    }
  }, [mode, filter, shuffled]);

  const submitAnswer = () => {
    if (!current) return;
    const isCorrect = checkAnswer(current, answers[current.id]);
    setSubmitted(prev => ({...prev, [current.id]: true}));
    setScore(prev => ({
      correct: prev.correct + (isCorrect?1:0),
      total: prev.total + 1,
      pts: prev.pts + (isCorrect?current.pts:0),
      maxPts: prev.maxPts + current.pts
    }));
  };

  const next = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
    else setMode("results");
  };

  if (mode === "menu") {
    return (
      <div style={{minHeight:"100vh", background:"#F5F5F5", fontFamily:'"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
        <div style={{background:"#2D3B45", padding:"12px 24px", borderBottom:"3px solid #0374B5"}}>
          <div style={{maxWidth:900, margin:"0 auto"}}>
            <div style={{fontSize:12, color:"#8B959E", letterSpacing:0.5}}>ACCT 403 — 2026W — Teoh</div>
            <div style={{fontSize:22, fontWeight:700, color:"#fff", marginTop:4}}>Final Exam Study Quiz</div>
          </div>
        </div>
        <div style={{maxWidth:900, margin:"0 auto", padding:"32px 24px"}}>
          <div style={{background:"#fff", border:"1px solid #C7CDD1", borderRadius:4, padding:"24px 28px", marginBottom:24}}>
            <h2 style={{margin:"0 0 4px", fontSize:18, color:"#2D3B45"}}>Instructions</h2>
            <p style={{fontSize:14, color:"#556572", lineHeight:1.6, margin:"8px 0 0"}}>
              Choose a section or quiz all {QUESTIONS.length} questions. Questions are modeled after past checkins and in-class quizzes. You can shuffle for a randomized experience.
            </p>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24}}>
            <button onClick={()=>startQuiz("All",false)} style={{padding:"16px 20px", background:"#0B874B", color:"#fff", border:"none", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer", textAlign:"left"}}>
              📝 All Questions ({QUESTIONS.length})
              <div style={{fontSize:12, fontWeight:400, opacity:0.85, marginTop:4}}>Sequential order</div>
            </button>
            <button onClick={()=>startQuiz("All",true)} style={{padding:"16px 20px", background:"#0374B5", color:"#fff", border:"none", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer", textAlign:"left"}}>
              🔀 All Questions — Shuffled
              <div style={{fontSize:12, fontWeight:400, opacity:0.85, marginTop:4}}>Random order</div>
            </button>
          </div>

          <h3 style={{fontSize:14, color:"#8B959E", textTransform:"uppercase", letterSpacing:1, marginBottom:12}}>By Section</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            {SECTIONS.map(s => {
              const count = QUESTIONS.filter(q=>q.section===s).length;
              return (
                <button key={s} onClick={()=>startQuiz(s,false)} style={{padding:"12px 16px", background:"#fff", border:"1px solid #C7CDD1", borderRadius:4, fontSize:14, fontWeight:500, cursor:"pointer", textAlign:"left", color:"#2D3B45", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  {s}
                  <span style={{background:"#E8E8E8", borderRadius:10, padding:"2px 10px", fontSize:12, color:"#556572"}}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "results") {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div style={{minHeight:"100vh", background:"#F5F5F5", fontFamily:'"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
        <div style={{background:"#2D3B45", padding:"16px 24px", borderBottom:"3px solid #0374B5"}}>
          <div style={{maxWidth:900, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div style={{fontSize:22, fontWeight:700, color:"#fff"}}>Quiz Complete</div>
            <button onClick={()=>setMode("menu")} style={{background:"#0374B5", color:"#fff", border:"none", padding:"8px 20px", borderRadius:4, fontSize:14, fontWeight:600, cursor:"pointer"}}>← Back to Menu</button>
          </div>
        </div>
        <div style={{maxWidth:900, margin:"0 auto", padding:"32px 24px"}}>
          <div style={{background:"#fff", border:"1px solid #C7CDD1", borderRadius:4, padding:"32px", textAlign:"center", marginBottom:24}}>
            <div style={{fontSize:64, fontWeight:700, color:pct>=70?"#0B874B":"#D93025"}}>{pct}%</div>
            <div style={{fontSize:18, color:"#556572", marginTop:8}}>{score.correct} of {score.total} correct • {score.pts} / {score.maxPts} pts</div>
            <div style={{display:"flex", gap:12, justifyContent:"center", marginTop:24}}>
              <button onClick={()=>startQuiz(filter, shuffled)} style={{background:"#0B874B", color:"#fff", border:"none", padding:"10px 24px", borderRadius:4, fontSize:14, fontWeight:600, cursor:"pointer"}}>Retry</button>
              <button onClick={()=>startQuiz(filter, true)} style={{background:"#0374B5", color:"#fff", border:"none", padding:"10px 24px", borderRadius:4, fontSize:14, fontWeight:600, cursor:"pointer"}}>Retry Shuffled</button>
              <button onClick={()=>setMode("menu")} style={{background:"#fff", color:"#2D3B45", border:"1px solid #C7CDD1", padding:"10px 24px", borderRadius:4, fontSize:14, fontWeight:600, cursor:"pointer"}}>Menu</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const isSubmitted = submitted[current.id];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  return (
    <div style={{display:"flex", height:"100vh", overflow:"hidden", fontFamily:'"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif'}}>
      <div style={{flex:1, minWidth:0, background:"#F5F5F5", display:"flex", flexDirection:"column", height:"100vh"}}>
        <div style={{background:"#2D3B45", padding:"12px 24px", borderBottom:"3px solid #0374B5", flexShrink:0}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <button onClick={()=>setMode("menu")} style={{background:"transparent", color:"#8B959E", border:"1px solid #556572", padding:"6px 14px", borderRadius:4, fontSize:13, cursor:"pointer"}}>Exit Quiz</button>
            <div style={{display:"flex", alignItems:"center", gap:16}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12, color:"#8B959E"}}>{filter === "All" ? "All Sections" : filter}{shuffled ? " \u{1F500}" : ""}</div>
                <div style={{fontSize:16, fontWeight:600, color:"#fff"}}>Question {currentIdx + 1} of {questions.length}</div>
              </div>
              <div style={{fontSize:14, color:"#8B959E"}}>{score.correct}/{score.total} correct</div>
              {!chatOpen && (
                <button onClick={()=>setChatOpen(true)} style={{background:"#0374B5", color:"#fff", border:"none", padding:"6px 14px", borderRadius:4, fontSize:13, cursor:"pointer"}}>Tutor</button>
              )}
            </div>
          </div>
        </div>
        <div style={{background:"#E8E8E8", height:3, flexShrink:0}}>
          <div style={{background:"#0374B5", height:3, width:`${progress}%`, transition:"width 0.3s"}} />
        </div>
        <div style={{flex:1, overflowY:"auto"}}>
          <div style={{maxWidth:900, margin:"0 auto", padding:"24px 24px"}}>
            <QuestionCard
              question={current}
              userAnswer={answers[current.id]}
              onAnswer={(val) => setAnswers(prev => ({...prev, [current.id]: val}))}
              showResult={isSubmitted}
              questionNum={currentIdx + 1}
              totalQuestions={questions.length}
            />
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                {currentIdx > 0 && (
                  <button onClick={()=>setCurrentIdx(currentIdx - 1)} style={{background:"#fff", color:"#2D3B45", border:"1px solid #C7CDD1", padding:"10px 28px", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer"}}>
                    ← Previous
                  </button>
                )}
              </div>
              <div>
                {!isSubmitted ? (
                  <button onClick={submitAnswer} disabled={answers[current.id]===undefined||answers[current.id]===null||(Array.isArray(answers[current.id])&&answers[current.id].length===0)} style={{background:answers[current.id]!==undefined&&answers[current.id]!==null?"#0374B5":"#C7CDD1", color:"#fff", border:"none", padding:"10px 28px", borderRadius:4, fontSize:15, fontWeight:600, cursor:answers[current.id]!==undefined?"pointer":"default"}}>
                    Submit Answer
                  </button>
                ) : (
                  <button onClick={next} style={{background:"#0B874B", color:"#fff", border:"none", padding:"10px 28px", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer"}}>
                    {currentIdx < questions.length - 1 ? "Next →" : "See Results"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatDrawer question={current} userAnswer={answers[current.id]} isSubmitted={!!isSubmitted} isOpen={chatOpen} onToggle={()=>setChatOpen(false)} messages={chatMessages} setMessages={setChatMessages} />
    </div>
  );
}