# Product

## Overview

The Contract Intelligence Platform is an AI-native vertical SaaS application designed to manage legal contracts of all kinds.

## Problem Solved

The platform addresses the need for a centralized system to manage, analyze, and query legal contracts. It aims to automate the extraction of key information, validate legal clauses, and provide reminders for important dates and deadlines.

## How it Works

The platform provides a comprehensive contract management solution with the following workflow:

1. **Contract Upload**: Users upload contract documents through a web interface.

2. **Document Processing**: 
   - The API receives the uploaded file and stores it in Google Cloud Storage
   - The contract is converted to markdown format and stored in GCS
   - Key information is extracted from the contract and structured schema is saved to Firestore database
   - The markdown content is chunked and stored in ChromaDB for semantic search

3. **Interactive Analysis**: Users can interact with their contracts through a chat interface powered by an AI agent, asking queries and setting up reminders.

4. **Contract Management**: Users can upload, delete, and modify contracts as needed.

## User Experience Goals

The platform aims to provide a seamless and intuitive user experience for managing legal contracts. The key goals include:

*   **Ease of Use**: A simple and user-friendly interface for generating and uploading contracts.
*   **Automation**: Automating the tedious process of contract creation and information extraction.
*   **Centralization**: A single source of truth for all legal contracts.
*   **Intelligence**: Providing intelligent insights and reminders to help users stay on top of their contractual obligations.
*   **Interactive Analysis**: A chat-based interface for natural language interaction with contract content.