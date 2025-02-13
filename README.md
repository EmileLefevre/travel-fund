# travel-fund
Travel Found 🌍
Travel Found is a web application designed to help users find and review travel-related services. Users can register, post comments with images, and interact with other travelers.

✨ Features
User Authentication: Secure sign-up and login using JWT authentication.
Comment System: Users can leave reviews with text and images.
Image Uploading: Multer is used to handle image uploads for comments.
Favorites System: Users can save their favorite locations.
Database Integration: MySQL stores user data, comments, and favorite locations.
🛠 Technologies Used
Backend: Node.js, Express.js
Database: MySQL
Authentication: JWT (JSON Web Token), Bcrypt
File Upload: Multer
Frontend: (If applicable, specify the technologies used)
🚀 Installation & Setup
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/EmileLefevre/travel-fund.git
cd travel-found
2️⃣ Install Dependencies
sh
Copy
Edit
npm install
3️⃣ Configure Environment Variables
Create a .env file in the root directory and add:

ini
Copy
Edit
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=travel_found
JWT_SECRET=your_secret_key
4️⃣ Run the Server
sh
Copy
Edit
npm start
The server will start at http://localhost:3000 🚀

📡 API Endpoints
📝 Comments API
POST /submit-comment → Add a comment with an optional image
GET /get-comments → Retrieve all comments
🔐 Authentication API
POST /register → Register a new user
POST /login → User login
📸 Image Uploads
Uploaded images are stored in the /uploads directory and served statically from /uploads/{filename}.

🤝 Contributing
If you'd like to contribute, feel free to fork the repository and submit a pull request.

📜 License
This project is licensed under the MIT License.