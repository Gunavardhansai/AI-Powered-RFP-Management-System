🚀 AI-Powered RFP Management System
===================================

An end-to-end **AI-assisted RFP (Request for Proposal) Management System** that allows enterprises to create RFPs from natural language, manage vendors, send automated email requests, receive proposals, and compare vendor responses using intelligent scoring.

This project is built using **free and open-source technologies only**, suitable for **academic evaluation, portfolio projects, interviews, and real-world prototypes**.

✨ Key Features
--------------

✅ Create RFPs from natural language prompts
✅ Extract items, budget, delivery, warranty automatically
✅ Manage vendors (add, list)
✅ Send RFPs via automated email
✅ Receive proposals via email simulation
✅ Auto-score and compare vendor proposals
✅ Identify best vendor automatically
✅ Clean multi-page UI
✅ Uses only free services

🏗️ Tech Stack
--------------

### ✅ Backend

*   Node.js
    
*   Express.js
    
*   PostgreSQL
    
*   Prisma ORM
    
*   Nodemailer (with Ethereal Email for free testing)
    
*   AI Parsing (local logic / mock AI service)
    

### ✅ Frontend

*   React (Vite)
    
*   React Router
    
*   React Query
    
*   Axios
    
*   Plain CSS
    

### ✅ Tools

*   Prisma CLI
    
*   Nodemon
    
*   Ethereal Email (Free email preview)
    

📂 Full Project Structure
-------------------------

ai-rfp-project/
├── README.md
├── .env.example│
├── backend/│ 
            ├── package.json│ 
            ├── prisma/│  
                       ├── schema.prisma│  
                       └── seed.js│ 
            ├── src/│  
                    ├── utils/│
                              ├── app.js│ │ 
                              ├── server.js│ │ 
                    ├── lib/│ 
                            ├── logger.js│
                            └── prismaClient.js│ 
                    ├── controllers/│ 
                                    ├── rfpController.js│ 
                                    ├── vendorController.js│  
                                    ├── proposalController.js│  
                                    └── emailController.js│  
                    ├── routes/│   
                               ├── rfpRoutes.js│ 
                               ├── vendorRoutes.js│  
                               ├── proposalRoutes.js│   
                               └── emailRoutes.js│  
                    └── services/│  
                                 ├── aiService.js│  
                                 ├── mailer.js│  
                                 └── scoring.js│
└── frontend/│
             ├── package.json
             ├── vite.config.js
             ├── .env.example
             └── src/│
                     ├── main.jsx
                     ├── App.jsx
                     ├── api/│ 
                             └── apiClient.js
                     ├── components/│ 
                                    ├── RFPChatCreate.jsx│ 
                                    ├── VendorList.jsx│ 
                                    ├── ProposalComparison.jsx│ 
                                    └── ProposalDetail.jsx
                     ├── pages/│ 
                               ├── RFPCreatePage.jsx│ 
                               ├── RFPListPage.jsx│ 
                               ├── RFPViewPage.jsx│ 
                               ├── ComparePage.jsx│ 
                               └── VendorsPage.jsx
             └── index.css

⚙️ Environment Setup
--------------------

### ✅ Backend .env

Create a file backend/.env:

DATABASE\_URL="postgresql://postgres:@localhost:5432/rfp\_db"

EMAIL\_FROM=rfp@localhostSMTP\_HOST=SMTP\_PORT=SMTP\_USER=SMTP\_PASS=

If SMTP is not configured, the system automatically uses **Ethereal Email** for free preview URLs.

🛠️ Installation & Setup
------------------------

### ✅ 1. Database Setup

createdb rfp\_db

Update the database password in .env.

### ✅ 2. Backend Setup

cd backendnpm installnpx prisma generatenpx prisma migrate devnpm run dev

✅ Backend runs at:[http://localhost:4000](http://localhost:4000)

### ✅ 3. Frontend Setup

cd frontendnpm installnpm run dev

✅ Frontend runs at:[http://localhost:5173](http://localhost:5173)

🧠 Example RFP Prompt
---------------------

We need 20 laptops with 16GB RAM and 512GB SSD, and 15 monitors.Budget is $50,000.Delivery within 30 days.Payment terms Net 30.Warranty minimum 1 year.

✅ The system automatically extracts:

*   Items
    
*   Budget
    
*   Delivery
    
*   Payment Terms
    
*   Warranty
    

🧑‍💼 Vendor Flow
-----------------

1.  Go to **Vendors Page**
    
2.  Add vendor:
    
    *   Name
        
    *   Email
        
3.  Vendor appears instantly
    

📩 Sending RFP via Email
------------------------

1.  Create RFP
    
2.  Select Vendor(s)
    
3.  Click **Send RFP**
    
4.  Backend logs:
    

Mail sentPreview URL: [https://ethereal.email/message/](https://ethereal.email/message/).....

✅ Open the preview URL to see the mail.

📊 Proposal Comparison Logic
----------------------------

*   If 2 vendor replies are identical → **No comparison shown**
    
*   If 2 vendor replies differ → **Comparison page activated**
    

Scores are generated using:

*   Price
    
*   Delivery
    
*   Warranty
    

✅ Best vendor is automatically highlighted.

🔌 API Endpoints
----------------

### ✅ RFP APIs

POST /api/rfps/from-text → Create RFP from promptGET /api/rfps → List RFPsGET /api/rfps/:id → Get single RFPPOST /api/rfps/:id/send → Send RFP to vendorsGET /api/rfps/:id/compare → Compare proposals

### ✅ Vendor APIs

GET /api/vendors → List vendorsPOST /api/vendors → Create vendor

✅ Free Email Handling
---------------------

This project uses **Ethereal Email**:

*   No real emails sent
    
*   Generates free preview URLs
    
*   Safe for testing and demos
    
*   No SMTP configuration required
    

📈 Scoring Algorithm
--------------------

Proposals are scored based on:

✅ Lower Price → Higher Score✅ Faster Delivery → Higher Score✅ Higher Warranty → Higher Score

Final score = **weighted total**.
