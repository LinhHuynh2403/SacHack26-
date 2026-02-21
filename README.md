# Data Pigeon Field Tech Copilot

An AI-powered mobile assistant for EV maintenance technicians, built for the **Data Pigeon AI Incident Response Hackathon**.

## 🚀 The Mission
Critical infrastructure like EV chargers face constant reliability challenges leading to expensive downtime. While Data Pigeon provides the predictive layer to identify these failures *before* they cause downtime, there is still a massive gap in how **human technicians** get those insights and execute repairs in the field.

The **Field Tech Copilot** bridges this gap. It is an intelligent support agent designed specifically to take Data Pigeon's predictive maintenance alerts and guide technicians through an ultra-fast, accurately-triaged repair process on-site.

## 🛠️ How it Works
1. **The Predictive Warning:** The app receives simulated predictive telemetry alerts from the Data Pigeon engine (e.g., "85% probability of Cooling Fan Failure on ABB Terra 54 in next 12 hours").
2. **The Context:** Technicians see the exact sensor data anomalies that led to the prediction *before* they arrive at the site.
3. **The AI Diagnostic Chat:** Upon arrival, the technician interacts with a specialized AI Support Agent. 
4. **Intelligent Retrieval (RAG):** The AI Agent is equipped with a custom Knowledge Base containing proprietary repair manuals and diagnostic codes for specific charger models (ABB, Tritium, ChargePoint, Tesla). It guides the tech step-by-step through the replacement, LOTO safety protocols, and software reset commands.

## 💡 Business Impact
*   **Maximize Uptime:** Pre-emptive repairs happen before a driver encounters a broken charger, preserving customer trust.
*   **Reduce Operational Costs:** By guiding techs efficiently and diagnosing the exact part needed *before* the truck rolls, we minimize time-on-site and eliminate costly "return trips."

## 📂 The Project Structure
*   `dummy_data/telemetry_alerts.json`: Synthetic dataset simulating incoming predictive alerts from Data Pigeon's core system.
*   `dummy_data/manuals/`: A repository of 24 synthesized repair manuals for various chargers. This serves as the local Knowledge Base for the AI's Retrieval-Augmented Generation (RAG) pipeline.
*   `generate_manuals.py`: The script used to generate realistic testing data for the hackathon constraints.

## 🏃‍♂️ Getting Started
*(Instructions on how to run the frontend and AI backend will go here)*