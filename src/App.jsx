Aby tvůj prompt pro Clauda (v roli Senior Full-stack/AI vývojáře) skutečně doručil to, co vidíš na diagramech, musí být strukturovaný tak, aby propojil Modul A (Interpretaci) s Modulem C (Care Journey).

Tady je kompletní zadání, které můžeš zkopírovat a vložit do Clauda. Obsahuje vše od logiky kategorizace až po push notifikace.

Prompt pro Claude: Implementation of Module C (Care Journey) & Notifications
Role: Senior Full-stack Developer & AI Specialist.

Task: Build a high-fidelity prototype for Module C (Care Journey). This module acts as a "Unified Action Center" that transforms AI-interpreted medical data into a structured, categorized patient checklist with integrated notifications.

1. Data Architecture & Extraction:
The module receives a JSON input from the AI Interpretation (Module A). You must implement a logic that maps data into exactly 4 categories:

Medication: Prescription changes, dosages (e.g., 1-0-0), and new medications.

Follow-up: Scheduled or recommended appointments and specialist visits.

Physical Rest: Recovery instructions, activity restrictions (e.g., no stairs), and lifestyle changes.

Administration & Documents: Referrals (Referrals), Sick Leave (Sick Leave Certificate), and Medical Clearance/Attestations.

2. UI/UX Requirements (React/Tailwind):

Dashboard: A clean, premium UI (Canadian Medical style). Display the 4 categories as interactive cards.

Checklist Functionality: Each item must be "completable" (checkbox/toggle).

Action Buttons: * Documents: Add "Download PDF" or "View" buttons.

Follow-up: Add "Add to Calendar" button.

Visual Cues: Use professional medical icons for each category.

3. Push Notification System (Simulation):
Implement a notification logic that triggers based on the tasks above:

Medication Alerts: Scheduled based on dosage (e.g., "Time for your morning Prestarium").

Appointment Reminders: Alerts for upcoming follow-ups (e.g., "Orthopedic check-up tomorrow").

Rest Reminders: Contextual tips (e.g., "Day 2 of physical rest: Remember to keep your knee elevated").

Document Alerts: Notification when a digital "Sick Leave" or "Referral" is ready.

UI: Simulate these as "Toast" notifications or a dedicated "Recent Alerts" center in the app.

4. Demo Mock Data (Patient: Michaela Nováková):
Use this specific data to populate the prototype:

Medication: "Continue Prestarium 5mg (1-0-0). Start Voltaren Gel on left knee 3x daily."

Follow-up: "Orthopedic follow-up at CM Park in 14 days. Cardiology check-up in 12 months."

Physical Rest: "Relative rest for 7 days. Avoid strenuous activity and running."

Administration: "Digital Sick Leave issued for 1 week. Referral for Knee X-ray available."

5. Technical Deliverables:

React Components: Modular code for the Care Journey dashboard and Notification system.

Data Schema: A clean JSON structure showing how the tasks and notifications are stored.

Deep Linking: Logic (mocked) where clicking a notification takes the user to the specific task card.
