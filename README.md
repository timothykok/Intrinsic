This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# How Intrinsic Works: Code & Finance Rundown

## 🏗️ Architecture Overview

```
User enters ticker → API fetches financial data → 3 valuation methods calculate → Display intrinsic value
```

---

## 📊 The Three Valuation Methods

### 1. **DCF (Discounted Cash Flow)** - "What future cash is worth today"

**Financial Logic:**
- Takes **Free Cash Flow to Equity (FCFE)** = Net Income + Depreciation + CapEx + Net Borrowing - ΔWorking Capital
- Projects it forward using growth rates:
  - **Years 1-5**: 5-year growth rate (based on ROE × retention ratio)
  - **Years 6-10**: 10-year growth rate (sector average)
  - **Year 11+**: Terminal/perpetuity value at 3% forever

**The Formula:**
$$PV = \sum_{t=1}^{10} \frac{FCFE_t}{(1+COE)^t} + \frac{FCFE_{10} \times (1+g)}{(COE - g)} \times \frac{1}{(1+COE)^{10}}$$

**Code Flow:**
```
home.client.js / stock.client.js
    ↓
calculateDCFPresentValue()
    ↓
FCFE.js (displays the calculation breakdown)
```

---

### 2. **Residual Income (RI)** - "Value above required return"

**Financial Logic:**
- Measures excess profit beyond what shareholders expect
- **Residual Income** = Net Income - (Equity × Cost of Equity)
- If a company earns more than its "cost" of equity capital, it creates value

**The Formula:**
$$Intrinsic\ Value = Book\ Value + \sum_{t=1}^{5} \frac{RI_t}{(1+COE)^t} + \frac{Terminal\ RI}{(COE - g)}$$

**Code Flow:**
```
home.client.js / stock.client.js
    ↓
calculateResidualPresentValue()
    ↓
ResidualCalculation.js (displays breakdown)
```

---

### 3. **Relative Valuation (Multiples)** - "What peers are worth"

**Financial Logic:**
- Simplest method: compare to similar companies
- **Intrinsic Value = EPS × Average Peer P/E Ratio**
- If peers trade at 20x earnings and company earns $5/share → worth ~$100

**Code Flow:**
```
home.client.js / stock.client.js
    ↓
calculateMultiplesPresentValue()
    ↓
MultiplesValue.js (displays peer comparison)
```

---

### 4. **Consolidated (C)** - "Average of all three"

Combines DCF + RI + Multiples and divides by 3 for a balanced estimate.

---

## 🔢 Key Inputs (from Financial Modeling Prep API)

| Data | Source Endpoint | Used For |
|------|-----------------|----------|
| Beta | `/profile` | Cost of Equity |
| Net Income | `/income-statement` | FCFE, Residual Income |
| Cash Flow Items | `/cash-flow-statement` | FCFE calculation |
| Book Value (Equity) | `/balance-sheet-statement` | Residual Income |
| EPS, P/E | `/quote` | Multiples |
| Peer List | `/stock_peers` | Average Peer P/E |
| Risk-Free Rate | `/treasury` | Cost of Equity |
| Market Risk Premium | `/market_risk_premium` | Cost of Equity |

---

## 💡 Cost of Equity (CAPM)

This is the **discount rate** - what investors expect to earn:

$$COE = Risk\ Free\ Rate + \beta \times Market\ Risk\ Premium$$

**Example:** 4.5% + 1.2 × 5% = **10.5%**

Higher beta = riskier stock = higher required return = lower present value.

---

## 🔄 Data Flow in Code

```
1. User enters "AAPL" → router.push('/stocks/AAPL')

2. stock.client.js (or home.client.js) runs useEffect:
   - Fetches 10+ API endpoints in parallel
   - Populates financialData state object

3. Cost of Equity calculated via CAPM

4. Three calculation functions run:
   - calculateDCFPresentValue()
   - calculateResidualPresentValue()  
   - calculateMultiplesPresentValue()

5. Results stored in state:
   - dcfValuePresentValue
   - residualIncomePresentValue
   - multiplesPresentValue

6. Per-share value = Total PV ÷ Outstanding Shares

7. UI components display based on selectedMethod (C, DCF, RI, RV)
```

---

## ⚠️ The Perpetuity Problem (Why ASML showed $90,926)

The **Gordon Growth Model** terminal value:

$$Terminal = \frac{Cash\ Flow \times (1+g)}{COE - g}$$

If COE = 5% and g = 3%, denominator = **2%** → multiplies cash flow by **50x**

**Safeguards added:**
1. Cap 5-year growth at 25%, 10-year at 15%
2. Minimum 2% spread between COE and growth rate
3. Skip calculation if COE ≤ growth rate

---

## 📁 Key Files Summary

| File | Purpose |
|------|---------|
| [stock.client.js](src/app/stocks/[ticker]/stock.client.js) | Main data fetching & calculation logic for stock pages |
| [home.client.js](src/app/home.client.js) | Home page with search (duplicate calculations) |
| [FCFE.js](src/app/ui/DCF/FCFE.js) | DCF valuation display & calculation |
| [ResidualCalculation.js](src/app/ui/Residual/ResidualCalculation.js) | Residual Income display |
| [MultiplesValue.js](src/app/ui/Multiples/MultiplesValue.js) | Relative valuation display |
| [Consolidated.js](src/app/ui/Consolidated.js) | Combined view of all methods |
| [StockInfo.js](src/app/ui/StockInfo.js) | Displays "We estimate X is worth $Y" |

---

## 🎯 

> "The app calculates what a stock is *actually worth* using three methods:
> 1. **DCF** - Projects future cash flows and discounts them back to today
> 2. **Residual Income** - Measures value created above investor expectations  
> 3. **Multiples** - Compares to what similar companies trade at
> 
> Then it averages them for a balanced estimate. The discount rate (Cost of Equity) comes from CAPM - riskier stocks need higher returns, making their present value lower."