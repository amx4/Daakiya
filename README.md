# Daakiya Pro

Daakiya Pro is a powerful, open-source API client inspired by Postman, built with Next.js. It provides a beautiful and intuitive interface for making HTTP requests, managing variables, and inspecting responses, all from within your browser.

## About The Project

This application is a modern API testing tool that simplifies the process of API development and testing. It leverages a modern tech stack to provide a fast, responsive, and feature-rich experience. The inclusion of an AI assistant and cURL command parsing makes it stand out as a highly productive tool for developers.

## Features

*   **Intuitive Request Builder**: Easily construct GET, POST, PUT, PATCH, DELETE requests with a user-friendly interface for URL, headers, and body.
*   **AI-Powered Request Generation**: Describe the request you want in plain English, and let the AI Assistant fill in the URL, headers, and body for you.
*   **cURL Command Importer**: Simply paste any cURL command into the URL input, and the app will automatically parse it and populate all the request fields.
*   **Global Variable Management**: Create and manage global variables (like API keys or base URLs) that can be easily substituted into your requests using `{{variable_name}}` syntax.
*   **Automatic Code Generation**: View auto-generated code snippets for your configured request in cURL, Python (with `requests`), and TypeScript (with `fetch`).
*   **Request History**: All sent requests are automatically saved to a local history panel, allowing you to quickly reload and re-run previous requests.
*   **Response Viewer**: Inspect server responses with support for pretty-printed JSON, response headers, status codes, and timing information.
*   **Dark Mode**: A sleek, dark-themed interface for a comfortable user experience.
*   **Built with Next.js & ShadCN**: A modern, performant, and beautifully designed application.

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### Installation & Usage

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

### Using Variables

To use variables, click on the settings icon in the header to open the "Global Variables" manager. Here you can add, edit, or remove variables.

Once a variable is defined (e.g., `GEMINI_API_KEY` with your key as the value), you can use it in your request URL, headers, or body with the `{{GEMINI_API_KEY}}` syntax.
