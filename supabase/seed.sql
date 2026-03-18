-- Seed flow templates for 6 featured industries
-- Each template has a realistic 3-step flow with scoring weights

-- Home Services
INSERT INTO flow_templates (name, description, industry, steps, is_featured, sort_order) VALUES
(
  'Home Services Qualifier',
  'Qualify homeowners for HVAC, plumbing, roofing, and general contracting leads based on project scope, timeline, and budget.',
  'home_services',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What type of service do you need?",
      "description": "Select the option that best describes your project.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Emergency repair (same day)", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Scheduled repair", "scoreWeight": 20},
        {"id": "opt_1c", "label": "New installation", "scoreWeight": 25},
        {"id": "opt_1d", "label": "Routine maintenance", "scoreWeight": 10},
        {"id": "opt_1e", "label": "Inspection or estimate only", "scoreWeight": 5},
        {"id": "opt_1f", "label": "Not sure yet", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "When do you need this done?",
      "description": "Help us understand your timeline.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "Today / ASAP", "scoreWeight": 30},
        {"id": "opt_2b", "label": "This week", "scoreWeight": 25},
        {"id": "opt_2c", "label": "Within 2 weeks", "scoreWeight": 15},
        {"id": "opt_2d", "label": "Within a month", "scoreWeight": 10},
        {"id": "opt_2e", "label": "Just exploring options", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "What is your estimated budget?",
      "description": "This helps us recommend the right solution.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "$5,000+", "scoreWeight": 30},
        {"id": "opt_3b", "label": "$2,000 - $5,000", "scoreWeight": 20},
        {"id": "opt_3c", "label": "$500 - $2,000", "scoreWeight": 15},
        {"id": "opt_3d", "label": "Under $500", "scoreWeight": 5},
        {"id": "opt_3e", "label": "Not sure / need estimate", "scoreWeight": 0}
      ]
    }
  ]'::jsonb,
  TRUE,
  1
),

-- Legal
(
  'Legal Intake Qualifier',
  'Screen potential clients for law firms by case type, urgency, and readiness to retain counsel.',
  'legal',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What type of legal matter do you need help with?",
      "description": "Select the category that best fits your situation.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Personal injury / accident", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Family law (divorce, custody)", "scoreWeight": 20},
        {"id": "opt_1c", "label": "Business / contract dispute", "scoreWeight": 25},
        {"id": "opt_1d", "label": "Criminal defense", "scoreWeight": 25},
        {"id": "opt_1e", "label": "Estate planning / wills", "scoreWeight": 15},
        {"id": "opt_1f", "label": "General legal question", "scoreWeight": 5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "How urgent is your legal need?",
      "description": "This helps us prioritize your consultation.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "Immediate - court date or deadline approaching", "scoreWeight": 30},
        {"id": "opt_2b", "label": "Within the next week", "scoreWeight": 20},
        {"id": "opt_2c", "label": "Within the next month", "scoreWeight": 10},
        {"id": "opt_2d", "label": "No rush - planning ahead", "scoreWeight": 0},
        {"id": "opt_2e", "label": "Just researching options", "scoreWeight": -10}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "Have you spoken with another attorney about this matter?",
      "description": "Understanding where you are in the process helps us serve you better.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "No, this is my first consultation", "scoreWeight": 25},
        {"id": "opt_3b", "label": "Yes, but I want a second opinion", "scoreWeight": 20},
        {"id": "opt_3c", "label": "Yes, and I am looking to switch attorneys", "scoreWeight": 15},
        {"id": "opt_3d", "label": "I have been referred by someone", "scoreWeight": 30}
      ]
    }
  ]'::jsonb,
  TRUE,
  2
),

-- Medical / Healthcare
(
  'Patient Intake Qualifier',
  'Qualify new patient inquiries for medical practices, dental offices, and specialty clinics by condition, insurance, and appointment readiness.',
  'medical',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What brings you in today?",
      "description": "Select the reason for your visit.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Acute pain or urgent symptom", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Follow-up on existing condition", "scoreWeight": 20},
        {"id": "opt_1c", "label": "New patient consultation", "scoreWeight": 25},
        {"id": "opt_1d", "label": "Elective or cosmetic procedure", "scoreWeight": 20},
        {"id": "opt_1e", "label": "Annual checkup or wellness visit", "scoreWeight": 10},
        {"id": "opt_1f", "label": "Just looking for information", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "Do you have insurance?",
      "description": "This helps us verify coverage before your appointment.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "Yes - PPO plan", "scoreWeight": 25},
        {"id": "opt_2b", "label": "Yes - HMO plan", "scoreWeight": 15},
        {"id": "opt_2c", "label": "Yes - Medicare or Medicaid", "scoreWeight": 10},
        {"id": "opt_2d", "label": "Self-pay / cash patient", "scoreWeight": 20},
        {"id": "opt_2e", "label": "Not sure about my coverage", "scoreWeight": 0}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "When would you like to schedule?",
      "description": "Let us know your preferred timeline.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "Today or tomorrow", "scoreWeight": 30},
        {"id": "opt_3b", "label": "This week", "scoreWeight": 20},
        {"id": "opt_3c", "label": "Next week", "scoreWeight": 15},
        {"id": "opt_3d", "label": "Flexible - within the next month", "scoreWeight": 5},
        {"id": "opt_3e", "label": "Just exploring, no appointment needed yet", "scoreWeight": -10}
      ]
    }
  ]'::jsonb,
  TRUE,
  3
),

-- Agency / Marketing
(
  'Agency Lead Qualifier',
  'Qualify inbound prospects for marketing, design, and development agencies by budget, project scope, and decision-making authority.',
  'agency',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What services are you interested in?",
      "description": "Select the area where you need the most help.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Full-service marketing strategy", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Website design or redesign", "scoreWeight": 25},
        {"id": "opt_1c", "label": "SEO and content marketing", "scoreWeight": 20},
        {"id": "opt_1d", "label": "Paid advertising (PPC / social)", "scoreWeight": 20},
        {"id": "opt_1e", "label": "Branding and identity", "scoreWeight": 15},
        {"id": "opt_1f", "label": "Not sure - need guidance", "scoreWeight": 5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "What is your monthly marketing budget?",
      "description": "This helps us tailor a proposal to your needs.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "$10,000+ per month", "scoreWeight": 30},
        {"id": "opt_2b", "label": "$5,000 - $10,000 per month", "scoreWeight": 25},
        {"id": "opt_2c", "label": "$2,000 - $5,000 per month", "scoreWeight": 15},
        {"id": "opt_2d", "label": "$500 - $2,000 per month", "scoreWeight": 5},
        {"id": "opt_2e", "label": "Still determining budget", "scoreWeight": 0},
        {"id": "opt_2f", "label": "One-time project (not ongoing)", "scoreWeight": 10}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "What is your role in this decision?",
      "description": "Understanding your authority helps us move faster.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "I am the final decision-maker", "scoreWeight": 30},
        {"id": "opt_3b", "label": "I influence the decision with a small team", "scoreWeight": 20},
        {"id": "opt_3c", "label": "I am researching for someone else", "scoreWeight": 5},
        {"id": "opt_3d", "label": "I am a founder or CEO", "scoreWeight": 25}
      ]
    }
  ]'::jsonb,
  TRUE,
  4
),

-- Real Estate
(
  'Real Estate Lead Qualifier',
  'Qualify buyers and sellers for real estate agents and brokerages by transaction type, timeline, and financial readiness.',
  'real_estate',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "Are you looking to buy or sell?",
      "description": "Tell us about your real estate goals.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Buy a home", "scoreWeight": 25},
        {"id": "opt_1b", "label": "Sell my home", "scoreWeight": 25},
        {"id": "opt_1c", "label": "Both - buy and sell", "scoreWeight": 30},
        {"id": "opt_1d", "label": "Investment property", "scoreWeight": 20},
        {"id": "opt_1e", "label": "Rental property", "scoreWeight": 15},
        {"id": "opt_1f", "label": "Just curious about my home value", "scoreWeight": 0}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "What is your timeline?",
      "description": "When are you hoping to make a move?",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "Immediately - actively looking", "scoreWeight": 30},
        {"id": "opt_2b", "label": "Within 1-3 months", "scoreWeight": 25},
        {"id": "opt_2c", "label": "3-6 months", "scoreWeight": 15},
        {"id": "opt_2d", "label": "6-12 months", "scoreWeight": 5},
        {"id": "opt_2e", "label": "Just starting to think about it", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "What is your financial readiness?",
      "description": "This helps us match you with the right resources.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "Pre-approved for a mortgage", "scoreWeight": 30},
        {"id": "opt_3b", "label": "Pre-qualified but not yet approved", "scoreWeight": 20},
        {"id": "opt_3c", "label": "Cash buyer", "scoreWeight": 30},
        {"id": "opt_3d", "label": "Have not started the financing process", "scoreWeight": 5},
        {"id": "opt_3e", "label": "Selling first, then buying", "scoreWeight": 15},
        {"id": "opt_3f", "label": "Not sure about my options", "scoreWeight": -10}
      ]
    }
  ]'::jsonb,
  TRUE,
  5
),

-- Consulting
(
  'Consulting Inquiry Qualifier',
  'Qualify prospective clients for consulting firms by engagement type, company size, and decision timeline.',
  'consulting',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What challenge are you looking to solve?",
      "description": "Select the area where you need expert guidance.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Strategic planning and growth", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Operational efficiency", "scoreWeight": 25},
        {"id": "opt_1c", "label": "Digital transformation", "scoreWeight": 25},
        {"id": "opt_1d", "label": "Financial restructuring", "scoreWeight": 20},
        {"id": "opt_1e", "label": "HR and organizational design", "scoreWeight": 15},
        {"id": "opt_1f", "label": "Other or not sure yet", "scoreWeight": 0}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "How large is your organization?",
      "description": "This helps us scope the engagement appropriately.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "Enterprise (500+ employees)", "scoreWeight": 30},
        {"id": "opt_2b", "label": "Mid-market (50-500 employees)", "scoreWeight": 25},
        {"id": "opt_2c", "label": "Small business (10-50 employees)", "scoreWeight": 15},
        {"id": "opt_2d", "label": "Startup (under 10 employees)", "scoreWeight": 10},
        {"id": "opt_2e", "label": "Solo or freelance", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "When do you need to kick off this engagement?",
      "description": "Understanding your timeline helps us allocate the right team.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "Immediately - this is a priority", "scoreWeight": 30},
        {"id": "opt_3b", "label": "Within the next 30 days", "scoreWeight": 20},
        {"id": "opt_3c", "label": "Next quarter", "scoreWeight": 10},
        {"id": "opt_3d", "label": "Planning for next year", "scoreWeight": 0},
        {"id": "opt_3e", "label": "Exploring options, no firm timeline", "scoreWeight": -10}
      ]
    }
  ]'::jsonb,
  TRUE,
  6
),

-- Hospitality
(
  'Hospitality Guest Qualifier',
  'Qualify event and booking inquiries for hotels, venues, and catering services by event type, guest count, and budget.',
  'hospitality',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What type of event are you planning?",
      "description": "Select the option that best describes your event.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Wedding or reception", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Corporate event or conference", "scoreWeight": 25},
        {"id": "opt_1c", "label": "Private party or celebration", "scoreWeight": 20},
        {"id": "opt_1d", "label": "Group hotel booking", "scoreWeight": 15},
        {"id": "opt_1e", "label": "Just browsing options", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "How many guests are you expecting?",
      "description": "This helps us recommend the right venue or package.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "200+ guests", "scoreWeight": 30},
        {"id": "opt_2b", "label": "100-200 guests", "scoreWeight": 25},
        {"id": "opt_2c", "label": "50-100 guests", "scoreWeight": 20},
        {"id": "opt_2d", "label": "Under 50 guests", "scoreWeight": 10},
        {"id": "opt_2e", "label": "Not sure yet", "scoreWeight": 0}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "What is your budget range?",
      "description": "Help us match you with the best options.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "$20,000+", "scoreWeight": 30},
        {"id": "opt_3b", "label": "$10,000 - $20,000", "scoreWeight": 25},
        {"id": "opt_3c", "label": "$5,000 - $10,000", "scoreWeight": 15},
        {"id": "opt_3d", "label": "Under $5,000", "scoreWeight": 5},
        {"id": "opt_3e", "label": "Still determining budget", "scoreWeight": -5}
      ]
    }
  ]'::jsonb,
  TRUE,
  7
),

-- Financial Services
(
  'Financial Services Qualifier',
  'Qualify prospects for financial advisors, accountants, and wealth management firms by service need, portfolio size, and timeline.',
  'financial',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What financial service are you looking for?",
      "description": "Select the area where you need assistance.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Wealth management or investing", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Retirement planning", "scoreWeight": 25},
        {"id": "opt_1c", "label": "Tax planning and preparation", "scoreWeight": 20},
        {"id": "opt_1d", "label": "Business accounting", "scoreWeight": 20},
        {"id": "opt_1e", "label": "Insurance review", "scoreWeight": 15},
        {"id": "opt_1f", "label": "General financial advice", "scoreWeight": 5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "What is your investable asset range?",
      "description": "This helps us connect you with the right advisor.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "$1M+", "scoreWeight": 30},
        {"id": "opt_2b", "label": "$500K - $1M", "scoreWeight": 25},
        {"id": "opt_2c", "label": "$100K - $500K", "scoreWeight": 20},
        {"id": "opt_2d", "label": "$25K - $100K", "scoreWeight": 10},
        {"id": "opt_2e", "label": "Under $25K", "scoreWeight": 0},
        {"id": "opt_2f", "label": "Prefer not to say", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "How soon do you need to get started?",
      "description": "Understanding your timeline helps us prioritize.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "Immediately - urgent need", "scoreWeight": 30},
        {"id": "opt_3b", "label": "Within the next month", "scoreWeight": 20},
        {"id": "opt_3c", "label": "Within the next quarter", "scoreWeight": 10},
        {"id": "opt_3d", "label": "No rush - exploring options", "scoreWeight": -5}
      ]
    }
  ]'::jsonb,
  TRUE,
  8
),

-- Fitness
(
  'Fitness Membership Qualifier',
  'Qualify prospective members for gyms, studios, and personal training services by fitness goal, experience level, and commitment.',
  'fitness',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What is your primary fitness goal?",
      "description": "Select the goal that matters most to you.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Weight loss and body transformation", "scoreWeight": 25},
        {"id": "opt_1b", "label": "Muscle building and strength", "scoreWeight": 25},
        {"id": "opt_1c", "label": "General health and wellness", "scoreWeight": 20},
        {"id": "opt_1d", "label": "Athletic performance", "scoreWeight": 20},
        {"id": "opt_1e", "label": "Rehabilitation or injury recovery", "scoreWeight": 15},
        {"id": "opt_1f", "label": "Just looking around", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "What is your current fitness level?",
      "description": "This helps us recommend the right program.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "Advanced - I train regularly", "scoreWeight": 20},
        {"id": "opt_2b", "label": "Intermediate - some experience", "scoreWeight": 25},
        {"id": "opt_2c", "label": "Beginner - just starting out", "scoreWeight": 30},
        {"id": "opt_2d", "label": "Returning after a long break", "scoreWeight": 25}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "What type of membership interests you?",
      "description": "Select your preferred option.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "Personal training (1-on-1)", "scoreWeight": 30},
        {"id": "opt_3b", "label": "Premium membership with classes", "scoreWeight": 25},
        {"id": "opt_3c", "label": "Standard gym membership", "scoreWeight": 15},
        {"id": "opt_3d", "label": "Class pack or drop-in", "scoreWeight": 10},
        {"id": "opt_3e", "label": "Free trial first", "scoreWeight": 5}
      ]
    }
  ]'::jsonb,
  TRUE,
  9
),

-- Education
(
  'Education Enrollment Qualifier',
  'Qualify prospective students and parents for schools, tutoring services, and online courses by program interest, timeline, and budget.',
  'education',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What type of program are you interested in?",
      "description": "Select the option that best describes your learning goal.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "Degree program (undergraduate or graduate)", "scoreWeight": 30},
        {"id": "opt_1b", "label": "Professional certification or bootcamp", "scoreWeight": 25},
        {"id": "opt_1c", "label": "K-12 tutoring or test prep", "scoreWeight": 20},
        {"id": "opt_1d", "label": "Online self-paced course", "scoreWeight": 15},
        {"id": "opt_1e", "label": "Corporate or team training", "scoreWeight": 25},
        {"id": "opt_1f", "label": "Just exploring options", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "When are you looking to start?",
      "description": "This helps us guide you to the right enrollment window.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "As soon as possible", "scoreWeight": 30},
        {"id": "opt_2b", "label": "Next semester or term", "scoreWeight": 20},
        {"id": "opt_2c", "label": "Within the next 6 months", "scoreWeight": 15},
        {"id": "opt_2d", "label": "Next year", "scoreWeight": 5},
        {"id": "opt_2e", "label": "No specific timeline", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "What is your budget for education?",
      "description": "This helps us recommend the right programs and financial aid options.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "$10,000+ per year", "scoreWeight": 30},
        {"id": "opt_3b", "label": "$5,000 - $10,000 per year", "scoreWeight": 20},
        {"id": "opt_3c", "label": "$1,000 - $5,000", "scoreWeight": 15},
        {"id": "opt_3d", "label": "Under $1,000", "scoreWeight": 5},
        {"id": "opt_3e", "label": "Need financial aid or scholarship", "scoreWeight": 10}
      ]
    }
  ]'::jsonb,
  TRUE,
  10
),

-- Other / General
(
  'General Lead Qualifier',
  'A versatile lead qualification flow for any industry, scoring prospects by need urgency, budget readiness, and decision authority.',
  'other',
  '[
    {
      "id": "step_1",
      "order": 1,
      "question": "What best describes your current need?",
      "description": "Help us understand how we can assist you.",
      "type": "single_select",
      "options": [
        {"id": "opt_1a", "label": "I have an urgent problem to solve", "scoreWeight": 30},
        {"id": "opt_1b", "label": "I am evaluating solutions for a project", "scoreWeight": 25},
        {"id": "opt_1c", "label": "I am looking to switch providers", "scoreWeight": 20},
        {"id": "opt_1d", "label": "I want to learn more about your services", "scoreWeight": 10},
        {"id": "opt_1e", "label": "Just browsing", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_2",
      "order": 2,
      "question": "What is your timeline for making a decision?",
      "description": "This helps us prioritize your inquiry.",
      "type": "single_select",
      "options": [
        {"id": "opt_2a", "label": "This week", "scoreWeight": 30},
        {"id": "opt_2b", "label": "This month", "scoreWeight": 20},
        {"id": "opt_2c", "label": "This quarter", "scoreWeight": 10},
        {"id": "opt_2d", "label": "No specific timeline", "scoreWeight": -5}
      ]
    },
    {
      "id": "step_3",
      "order": 3,
      "question": "What is your role in this decision?",
      "description": "Understanding your authority helps us tailor our response.",
      "type": "single_select",
      "options": [
        {"id": "opt_3a", "label": "I am the decision-maker", "scoreWeight": 30},
        {"id": "opt_3b", "label": "I am part of a buying committee", "scoreWeight": 20},
        {"id": "opt_3c", "label": "I am researching for someone else", "scoreWeight": 5},
        {"id": "opt_3d", "label": "I am evaluating for future reference", "scoreWeight": 0}
      ]
    }
  ]'::jsonb,
  TRUE,
  11
);

-- ---------------------------------------------------------------------------
-- Email template seed data
-- ---------------------------------------------------------------------------

INSERT INTO email_templates (slug, subject, body_html, body_text, variables) VALUES
(
  'new_lead_notification',
  'New Lead: {{visitorName}} scored {{leadScore}} ({{leadTier}})',
  '<html><body><h1>New Lead Received</h1><p>A new lead has been submitted through your widget <strong>{{widgetName}}</strong>.</p><p><strong>Name:</strong> {{visitorName}}<br/><strong>Score:</strong> {{leadScore}}<br/><strong>Tier:</strong> {{leadTier}}</p><p><a href="{{dashboardUrl}}">View in Dashboard</a></p></body></html>',
  'New Lead Received\n\nA new lead has been submitted through your widget {{widgetName}}.\n\nName: {{visitorName}}\nScore: {{leadScore}}\nTier: {{leadTier}}\n\nView in Dashboard: {{dashboardUrl}}',
  '{"visitorName","leadScore","leadTier","widgetName","dashboardUrl"}'
),
(
  'hot_lead_followup',
  'Hot Lead Alert: {{visitorName}} needs immediate attention',
  '<html><body><h1>Hot Lead Alert</h1><p>A high-scoring lead just came in through <strong>{{widgetName}}</strong>.</p><p><strong>Name:</strong> {{visitorName}}<br/><strong>Email:</strong> {{visitorEmail}}<br/><strong>Score:</strong> {{leadScore}}</p><p>This lead scored in the <strong>Hot</strong> tier and should be contacted as soon as possible.</p><p><a href="{{dashboardUrl}}">View Lead Details</a></p></body></html>',
  'Hot Lead Alert\n\nA high-scoring lead just came in through {{widgetName}}.\n\nName: {{visitorName}}\nEmail: {{visitorEmail}}\nScore: {{leadScore}}\n\nThis lead scored in the Hot tier and should be contacted as soon as possible.\n\nView Lead Details: {{dashboardUrl}}',
  '{"visitorName","visitorEmail","leadScore","widgetName","dashboardUrl"}'
),
(
  'welcome',
  'Welcome to SignalBox, {{userName}}!',
  '<html><body><h1>Welcome to SignalBox!</h1><p>Hi {{userName}},</p><p>Thank you for signing up. Your {{planName}} trial is now active and will expire on {{trialEndDate}}.</p><p>Get started by creating your first widget:</p><p><a href="{{dashboardUrl}}">Go to Dashboard</a></p></body></html>',
  'Welcome to SignalBox!\n\nHi {{userName}},\n\nThank you for signing up. Your {{planName}} trial is now active and will expire on {{trialEndDate}}.\n\nGet started by creating your first widget:\n\n{{dashboardUrl}}',
  '{"userName","planName","trialEndDate","dashboardUrl"}'
),
(
  'trial_ending',
  'Your SignalBox trial ends in {{daysRemaining}} days',
  '<html><body><h1>Your Trial is Ending Soon</h1><p>Hi {{userName}},</p><p>Your SignalBox trial will expire in <strong>{{daysRemaining}} days</strong> on {{trialEndDate}}.</p><p>To keep your widgets active and continue capturing leads, please upgrade your plan.</p><p><a href="{{upgradeUrl}}">Upgrade Now</a></p></body></html>',
  'Your Trial is Ending Soon\n\nHi {{userName}},\n\nYour SignalBox trial will expire in {{daysRemaining}} days on {{trialEndDate}}.\n\nTo keep your widgets active and continue capturing leads, please upgrade your plan.\n\nUpgrade Now: {{upgradeUrl}}',
  '{"userName","daysRemaining","trialEndDate","upgradeUrl"}'
),
(
  'trial_expired',
  'Your SignalBox trial has expired',
  '<html><body><h1>Your Trial Has Expired</h1><p>Hi {{userName}},</p><p>Your SignalBox trial expired on {{trialEndDate}}. Your widgets are now paused and will not collect new leads.</p><p>Upgrade to a paid plan to reactivate your widgets instantly.</p><p><a href="{{upgradeUrl}}">Upgrade Now</a></p></body></html>',
  'Your Trial Has Expired\n\nHi {{userName}},\n\nYour SignalBox trial expired on {{trialEndDate}}. Your widgets are now paused and will not collect new leads.\n\nUpgrade to a paid plan to reactivate your widgets instantly.\n\nUpgrade Now: {{upgradeUrl}}',
  '{"userName","trialEndDate","upgradeUrl"}'
),
(
  'weekly_digest',
  'Your Weekly SignalBox Digest: {{totalLeads}} new leads',
  '<html><body><h1>Weekly Lead Digest</h1><p>Hi {{userName}},</p><p>Here is your weekly summary for {{weekRange}}:</p><ul><li><strong>New leads:</strong> {{totalLeads}}</li><li><strong>Hot leads:</strong> {{hotLeads}}</li><li><strong>Top widget:</strong> {{topWidgetName}}</li></ul><p><a href="{{dashboardUrl}}">View Full Report</a></p></body></html>',
  'Weekly Lead Digest\n\nHi {{userName}},\n\nHere is your weekly summary for {{weekRange}}:\n\n- New leads: {{totalLeads}}\n- Hot leads: {{hotLeads}}\n- Top widget: {{topWidgetName}}\n\nView Full Report: {{dashboardUrl}}',
  '{"userName","weekRange","totalLeads","hotLeads","topWidgetName","dashboardUrl"}'
),
(
  'payment_failed',
  'Action required: Payment failed for your SignalBox account',
  '<html><body><h1>Payment Failed</h1><p>Hi {{userName}},</p><p>We were unable to process your payment of <strong>{{amount}}</strong> on {{failedDate}}.</p><p>Please update your payment method to avoid service interruption. Your widgets will be paused if payment is not resolved within {{graceDays}} days.</p><p><a href="{{billingUrl}}">Update Payment Method</a></p></body></html>',
  'Payment Failed\n\nHi {{userName}},\n\nWe were unable to process your payment of {{amount}} on {{failedDate}}.\n\nPlease update your payment method to avoid service interruption. Your widgets will be paused if payment is not resolved within {{graceDays}} days.\n\nUpdate Payment Method: {{billingUrl}}',
  '{"userName","amount","failedDate","graceDays","billingUrl"}'
),
(
  'webhook_failures',
  'Webhook delivery failures detected on {{widgetName}}',
  '<html><body><h1>Webhook Delivery Failures</h1><p>Hi {{userName}},</p><p>We detected <strong>{{failureCount}}</strong> consecutive webhook delivery failures for your widget <strong>{{widgetName}}</strong>.</p><p><strong>Endpoint:</strong> {{webhookUrl}}<br/><strong>Last error:</strong> {{lastError}}</p><p>Please check your endpoint and update it if needed. The webhook will be automatically disabled after {{maxRetries}} consecutive failures.</p><p><a href="{{settingsUrl}}">Manage Webhooks</a></p></body></html>',
  'Webhook Delivery Failures\n\nHi {{userName}},\n\nWe detected {{failureCount}} consecutive webhook delivery failures for your widget {{widgetName}}.\n\nEndpoint: {{webhookUrl}}\nLast error: {{lastError}}\n\nPlease check your endpoint and update it if needed. The webhook will be automatically disabled after {{maxRetries}} consecutive failures.\n\nManage Webhooks: {{settingsUrl}}',
  '{"userName","failureCount","widgetName","webhookUrl","lastError","maxRetries","settingsUrl"}'
);
