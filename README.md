# 🌐 Mautskebeli.ge

Mautskebeli.ge is an independent media platform focused on broadcasting social issues in Georgia. The platform provides diverse content through articles, videos, and podcasts.

## 📚 Project Overview
Mautskebeli.ge serves as a comprehensive media platform that integrates modern technologies to deliver high-quality content across multiple formats. It offers a seamless experience for users accessing articles, podcasts, and video content, with robust back-end management features for administrators.

## ✨ Features

### 🖥️ Responsive Web Application
Built with Next.js and Tailwind CSS for a fully responsive and user-friendly interface.

### 📝 WordPress as Headless CMS
Utilized as an admin panel where content such as articles, videos, and translations can be uploaded, edited, and managed. ACF (Advanced Custom Fields) post types and field groups were configured for efficient content management.

### 🔄 Dynamic Content Fetching
Implemented REST API to fetch and render content dynamically on the front end.

### 🔧 Custom REST API Endpoints
Developed specific endpoints to support custom features and enhance flexibility.

### ▶️ Custom Video Player
Created a video player with branded controls (purple control bar, custom play button) that can play both stored videos and live-streamed YouTube podcasts.

### 🎥 Live Video Integration
Integrated YouTube API to fetch and display live-streamed podcasts directly on the platform.

### 📰 Social Media Integration
Integrated Facebook API to fetch and display the latest news posts with custom styling.

### ✉️ Email Subscription
Implemented a subscription form that saves user information to WordPress and integrates with Brevo API for seamless contact list management and email automation.

### 💳 Donation System
Developed a complex donation system integrated with TBC Bank API, supporting both one-time and recurring donations with custom handling for emails and transactions.

### ⚙️ Enhanced Admin Capabilities
Modified `functions.php` extensively to meet project-specific needs and enable custom functionalities.

## 🛠️ Technologies Used

### Front-End
- Next.js (App directory and folder-based routing)
- Tailwind CSS

### Back-End
- WordPress (Headless CMS for admin functionalities)
- PHP (custom modifications and server-side logic)

### APIs and Integrations
- Custom REST API endpoints for data fetching
- YouTube API for video integration
- Facebook API for news fetching
- Brevo API for managing email subscriptions
- TBC Bank API for donation processing

## ⚙️ Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/anukitsim/Mautskebeli.ge.git

   Navigate to the Project Directory:

bash
Copy code
cd Mautskebeli.ge
Install Dependencies:

bash
Copy code
npm install
Run the Development Server:

bash
Copy code
npm run dev
Visit http://localhost:3000 to view the application.

🚀 Deployment
The website is deployed on Vercel, ensuring optimal performance and continuous integration for new feature updates.

🗂️ Project Structure

Mautskebeli.ge/
├── app/
├── public/
│   └── images/
├── style/
├── utils/
├── .gitignore
├── README.md
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.js
├── redirects.json
└── tailwind.config.js
app/: Contains the main application components and pages.
public/: Hosts static assets such as images.
style/: Includes global styling.
utils/: Utility functions and shared modules.
🔑 Key Functionalities
▶️ Custom Video Player
Full-featured video player with branded controls and the ability to display live YouTube streams.

✉️ Email Integration
Contact information collected via forms is stored in both WordPress and Brevo, enabling efficient email management.

💳 Donation System
Comprehensive integration with TBC Bank API for secure, recurring, and one-time donations, complete with detailed email notifications and user-friendly cancellation options.

🛠️ Admin Panel Customization
Extensive modification of functions.php for tailored WordPress admin functionality.

📰 Dynamic Social Media Content
Automated fetching and rendering of the latest Facebook posts.

📞 Contact
For more information or to collaborate on future updates, please contact:

Email: anukacim@gmail.com

LinkedIn: linkedin.com/in/anuki-tsimintia
