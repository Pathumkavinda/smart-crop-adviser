@echo off
REM setup.bat - Automated setup script for Windows
REM Save this as setup.bat in your crop-ml-service folder and double-click it

echo.
echo 🌾 Smart Crop Recommendation System - Automated Setup
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "main.py" (
    echo ❌ Error: main.py not found!
    echo Please make sure you're running this script in the crop-ml-service folder
    pause
    exit /b 1
)

echo ✅ Found main.py - we're in the right directory
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo ✅ Python is installed
python --version
echo.

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo 📦 Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)
echo.

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    echo Trying alternative activation method...
    .venv\Scripts\activate
)

REM Upgrade pip
echo 📦 Upgrading pip...
python -m pip install --upgrade pip

REM Install required packages
echo 📦 Installing required packages...
echo This may take a few minutes...

pip install fastapi==0.104.1
if errorlevel 1 goto :install_error

pip install "uvicorn[standard]==0.24.0"
if errorlevel 1 goto :install_error

pip install python-multipart==0.0.6
if errorlevel 1 goto :install_error

pip install "scikit-learn>=1.6.0"
if errorlevel 1 goto :install_error

pip install "pandas>=2.0.3"
if errorlevel 1 goto :install_error

pip install "numpy>=1.26.0"
if errorlevel 1 goto :install_error

pip install "pydantic>=2.5.0"
if errorlevel 1 goto :install_error

pip install python-dotenv==1.0.0
if errorlevel 1 goto :install_error

echo ✅ All packages installed successfully!
echo.

REM Create models directory
if not exist "models" (
    mkdir models
    echo ✅ Created models directory
)

REM Test installation
echo 🧪 Testing installation...
python -c "import fastapi; print(f'✅ FastAPI {fastapi.__version__}')"
if errorlevel 1 goto :test_error

python -c "import uvicorn; print(f'✅ Uvicorn {uvicorn.__version__}')"
if errorlevel 1 goto :test_error

python -c "import sklearn; print(f'✅ Scikit-learn {sklearn.__version__}')"
if errorlevel 1 goto :test_error

echo.
echo 🎉 SETUP COMPLETE!
echo ============================================================
echo.
echo 📝 Next steps:
echo.
echo 1. Train your ML model (if you haven't already):
echo    - Go to Google Colab
echo    - Run your training notebook
echo    - Download: crop_recommendation_model_PRODUCTION.pkl
echo    - Place it in the models\ folder
echo.
echo 2. Start the server:
echo    - Option A (minimal test server): python minimal_server.py
echo    - Option B (real ML server): uvicorn main:app --reload
echo.
echo 3. Start your Next.js app in another terminal:
echo    - cd .. 
echo    - npm run dev
echo.
echo 4. Access your app:
echo    - Backend: http://localhost:8000
echo    - Frontend: http://localhost:3000/adviser
echo.
echo ✨ Happy farming! 🚜
echo.
pause
exit /b 0

:install_error
echo.
echo ❌ Error installing packages!
echo.
echo 💡 Try these solutions:
echo 1. Run as Administrator
echo 2. Check your internet connection
echo 3. Try: pip install --trusted-host pypi.org --trusted-host pypi.python.org [package]
echo 4. Update Python: https://python.org
echo.
pause
exit /b 1

:test_error
echo.
echo ❌ Package installation test failed!
echo The packages were installed but can't be imported.
echo This might be a Python path or virtual environment issue.
echo.
echo 💡 Try running the commands manually:
echo 1. .venv\Scripts\activate
echo 2. python -c "import fastapi; print('FastAPI works!')"
echo.
pause
exit /b 1