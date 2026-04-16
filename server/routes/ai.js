const express = require('express');
const router = express.Router();
const db = require('../db');

// Hardcoded key as per instructions (In production this should be in .env)
const OPENROUTER_API_KEY = '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';
const SITE_URL = 'http://localhost:3000'; // Update with actual site URL
const SITE_NAME = 'SMB Finance';

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // 1. Gather Context (Expanded)

        // Total Collections Today
        const [todayCollectionsResult] = await db.query(`
            SELECT SUM(paid_due) as total 
            FROM smb_transactions_history 
            WHERE DATE(transaction_date) = CURRENT_DATE()
        `);
        const todayCollections = todayCollectionsResult[0].total || 0;

        // Overdue Customers Count
        const [overdueResult] = await db.query(`
            SELECT COUNT(*) as count 
            FROM smb_customer_details 
            WHERE tot_due_amt > 0
        `);
        const overdueCount = overdueResult[0].count || 0;

        // Active Loans
        const [activeLoansResult] = await db.query(`
            SELECT COUNT(*) as count 
            FROM smb_customer_details 
            WHERE cust_status IN ('ACTIVE', 'A', 'U')
        `);
        const activeLoans = activeLoansResult[0].count || 0;

        // Weekly Collections Trend (Last 7 Days)
        const [weeklyTrendResult] = await db.query(`
            SELECT DATE_FORMAT(transaction_date, '%a') as name, SUM(paid_due) as value
            FROM smb_transactions_history
            WHERE transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
            GROUP BY DATE(transaction_date)
            ORDER BY DATE(transaction_date)
        `);
        const weeklyTrend = JSON.stringify(weeklyTrendResult);

        // Expense Breakdown (By Category)
        const [expensesResult] = await db.query(`
            SELECT category as name, SUM(amount) as value
            FROM smb_expenses
            GROUP BY category
        `);
        // Add minimal color logic if needed, or handle in frontend
        const expenses = JSON.stringify(expensesResult);

        // Top 5 Products (by Sales Count from ITEM_DETAILS)
        const [productsResult] = await db.query(`
            SELECT ITEM_NAME as product_name, COUNT(*) as sales_count, SUM(SALED_PRICE) as total_revenue
            FROM ITEM_DETAILS
            WHERE ITEM_NAME IS NOT NULL
            GROUP BY ITEM_NAME
            ORDER BY sales_count DESC
            LIMIT 5
        `);
        const topProducts = productsResult.map(p => `${p.product_name} (Sales: ${p.sales_count}, Revenue: ${p.total_revenue})`).join(', ');

        // Customer Context (Recent/Overdue) - Limit 200 to fit context
        // Fetching last payment details using subqueries for performance on limited set
        const [customersResult] = await db.query(`
            SELECT 
                c.customer_name, 
                c.phone_number, 
                c.tot_due_amt, 
                c.cust_status,
                (SELECT paid_date FROM smb_transactions_history t WHERE t.customer_id = c.customer_id ORDER BY transaction_date DESC LIMIT 1) as last_paid_date,
                (SELECT paid_due FROM smb_transactions_history t WHERE t.customer_id = c.customer_id ORDER BY transaction_date DESC LIMIT 1) as last_paid_amount
            FROM smb_customer_details c
            WHERE c.tot_due_amt > 0 OR c.cust_status IN ('ACTIVE', 'A')
            ORDER BY c.tot_due_amt DESC
            LIMIT 200
        `);
        const customerList = customersResult.map(c =>
            `Name: ${c.customer_name}, Phone: ${c.phone_number}, Due: ${c.tot_due_amt}, Status: ${c.cust_status}, Last Pay: ${c.last_paid_amount || 0} on ${c.last_paid_date || 'N/A'}`
        ).join('\n');

        // Last 30 Days Collections (for specific date queries)
        const [last30DaysResult] = await db.query(`
            SELECT DATE_FORMAT(transaction_date, '%Y-%m-%d') as date, SUM(paid_due) as total
            FROM smb_transactions_history
            WHERE transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            GROUP BY DATE(transaction_date)
            ORDER BY DATE(transaction_date) DESC
        `);
        const last30Days = last30DaysResult.map(d => `${d.date}: ₹${d.total}`).join('\n');

        // Prepare System Prompt
        const systemPrompt = `You are an AI Business Assistant for SMB Finance. 
You have access to the following real-time business context:

# Key Metrics
- Today's Total Collections: ${todayCollections}
- Number of Overdue Customers: ${overdueCount}
- Active Loans: ${activeLoans}

# Weekly Collections Trend (Last 7 Days)
${weeklyTrend}

# Expense Breakdown
${expenses}

# Key Products
${topProducts}

# Last 30 Days Collections (Use for specific date queries)
${last30Days}

# Customer Data (Top 200 Active/Overdue)
${customerList}

# Instructions
1. Answer the user's question based on this data.
2. ALWAYS use Indian Rupees (₹) for currency amounts. Do NOT use Dollars ($).
3. Format all currency amounts in **bold** (e.g., **₹5,000**).
4. If the user asks for a chart, graph, or visual trend, you MUST return a valid JSON object wrapped in \`###JSON_START###\` and \`###JSON_END###\`.
5. The JSON structure for charts is:
   {
     "type": "CHART",
     "chartType": "bar" | "line" | "pie",
     "title": "Chart Title",
     "data": [ { "name": "Label", "value": 123 } ],
     "message": "Text explanation to go with the chart."
   }
6. If no chart is needed, just provide a text response.
7. Keep answers concise and professional.
8. If asked for a customer's phone number or details, check the 'Customer Data' section above.
9. **EMI Calculation**: If asked to calculate EMI, use the formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1).
   - P = Principal Amount
   - r = Monthly Interest Rate (Annual Rate / 12 / 100)
   - n = Loan Tenure in Months
   - Show the step-by-step calculation.`;

        // 2. Call OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "arcee-ai/trinity-large-preview:free",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": message }
                ],
                "reasoning": {
                    "enabled": true
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', errorText);

            // Fallback response if AI fails (e.g. rate limit or model unavailable)
            if (response.status === 429 || response.status >= 500) {
                return res.json({
                    reply: `I'm currently experiencing high traffic. Here is the data I have:
                    - Today's Collections: ${todayCollections}
                    - Overdue Customers: ${overdueCount}
                    - Active Loans: ${activeLoans}`
                });
            }

            throw new Error(`OpenRouter responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        res.json({ reply });

    } catch (err) {
        console.error('AI Chat Error:', err);
        res.status(500).json({ message: 'Failed to process AI request' });
    }
});

module.exports = router;
