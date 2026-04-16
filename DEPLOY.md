# Deployment Guide for Hostinger (Single Node.js App)

Your application has been prepared to run as a single Node.js application (Backend + Frontend together).

## 1. Prepare the Zip File
1.  Navigate to the `server` folder:
    `c:\Users\manoh\Downloads\nova-core-main\nova-core-main\server`
2.  Select **ALL** files and folders inside `server` (including `public`, `routes`, `index.js`, `package.json`, etc.).
3.  Right-click and zip them into a file named `deploy.zip` (or similar).

## 2. Hostinger Setup
1.  Log in to your Hostinger hPanel.
2.  Go to **Websites** -> **Manage** (for `smbfnc.com`).
3.  Search for **Node.js** in the sidebar.
4.  **Create a Node.js Application**:
    - **Application Root**: `public_html` (or a subdirectory if you prefer).
    - **Application URL**: `smbfnc.com` (or subdirectory).
    - **Application Startup File**: `index.js`
    - **Node.js Version**: Select the latest stable version (e.g., 18 or 20).
    - Click **Create**.

## 3. Upload Files
1.  Go to **File Manager**.
2.  Navigate to the directory where you created the Node.js app (e.g., `public_html`).
3.  **Delete** any existing default files (if any).
4.  **Upload** your `deploy.zip` file.
5.  Right-click the zip and **Extract**.
6.  Ensure all files (`index.js`, `package.json`, `public/`, etc.) are directly in the application root, not inside a subfolder.

## 4. Install Dependencies
1.  Go back to the **Node.js** section in hPanel.
2.  Click the **NPM Install** button.
    - This will run `npm install` on the server to install backend dependencies.

## 5. Environment Variables
1.  In the **Node.js** section on Hostinger, find **Environment Variables** (or create a `.env` file in File Manager).
2.  Add your database credentials and other secrets:
    ```
    DB_HOST=srv1321.hstgr.io
    DB_USER=u317148124_smb
    DB_PASSWORD=h9=i9wX|X
    DB_NAME=u317148124_smb
    JWT_SECRET=your_jwt_secret
    PORT=3000
    ```
    *(Note: Hostinger might assign a custom port, but `process.env.PORT` in `index.js` handles that).*

## 6. Start the Server
1.  In the **Node.js** section, click **Restart** or **Start**.
2.  Visit `https://smbfnc.com`. You should see your application!

## Troubleshooting
- If you see a generic error, check the **Error Logs** in hPanel.
- Ensure the **Startup File** is set to `index.js` correctly.
- Ensure `node_modules` was created successfully by the "NPM Install" button.
