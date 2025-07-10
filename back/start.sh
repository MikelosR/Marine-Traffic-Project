#!/usr/bin/bash
echo "🚀 Starting SeaX Maritime Surveillance Platform..."

docker-compose down --remove-orphans
docker-compose up -d    #NO --build flag!

echo "⏳ Waiting for services to start..."
sleep 14

echo "🌐 Opening browser..."
# WSL-specific browser opening
if [[ -f "/mnt/c/Program Files/Mozilla Firefox/firefox.exe" ]]; then
    "/mnt/c/Program Files/Mozilla Firefox/firefox.exe" http://localhost:3000 &
elif [[ -f "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" ]]; then
    "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" http://localhost:3000 &
else
    echo "❌ Browser not found. Please open http://localhost:3000 manually"
fi

echo "✅ All services started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"

# Follow logs
docker-compose logs -f