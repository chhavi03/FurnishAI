# 🪑 FurnishIQ – AI Furniture Recommender 🧠🏠

**FurnishIQ** is an **AI-powered furniture recommendation web application** that helps users discover furniture styles, layouts, and product combinations intelligently.  
It combines **data analytics**, **machine learning**, and a **React + Python full-stack architecture** to create a personalized and visually engaging furnishing experience.

> 💡 **Note:** This project is for research and demonstration purposes — it is not a commercial product.

---

## ✨ Features
- **Smart Recommendations:** Suggests furniture based on user preferences, room type, and style.  
- **Interactive UI:** Modern React-based interface for browsing, searching, and customizing furniture sets.  
- **Data-Driven Insights:** Data science notebooks analyze user behavior and trends.  
- **RESTful Backend:** Python APIs for handling user queries and serving intelligent responses.  
- **Dockerized Deployment:** Easily run the entire system in a containerized setup.

---

## 🗂️ Project Structure
```

furnishIQ/
│
├── backend/               # Python backend (Flask/FastAPI)
│ ├── app.py               # Entry point for backend server
│ ├── api/                 # API routes and logic
│ └── models/              # ML or data models (if any)
│
├── frontend/              # React + TypeScript frontend
│ ├── src/                 # Components, pages, assets
│ └── package.json         # Frontend dependencies
│
├── notebooks/             # Data science and ML notebooks
│ ├── recommendation.ipynb
│ └── analysis.ipynb
│
├── Dockerfile             # Container build
├── requirements.txt       # Python dependencies
├── .gitignore
└── README.md              # Project documentation

````

---




---

## 🧰 Tech Stack
- **Frontend:** React, TypeScript, HTML, CSS  
- **Backend:** Python (Flask / FastAPI)  
- **Data Analysis:** Jupyter, Pandas, NumPy, Scikit-learn  
- **Database:** SQLite / MongoDB (configurable)  
- **DevOps:** Docker, GitHub Actions (optional for CI/CD)

---

## ⚙️ Prerequisites
- Node.js v14+  
- Python 3.8+  
- Docker (optional but recommended)  
- Git  

---

## 🔐 Environment Variables
Create a `.env` file in the project root:
```bash
DATABASE_URL=sqlite:///furnishiq.db
API_KEY=your_secret_key_here
PORT=8000
````

---

## 🚀 Quickstart (Local)

1. **Clone the repo**

```bash
git clone https://github.com/jatin1bagga/furnishIQ.git
cd furnishIQ

```

2. **Setup Python environment**

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate


```


3. **Install dependencies**
```bash
pip install -r ../requirements.txt

```

4. **Run the backend**
```bash
python app.py
# or
uvicorn app:app --reload

```
5. **Setup frontend**
```bash
cd ../frontend
npm install
npm start
```
6. **Access the app**

```bash
http://localhost:3000
```
   
